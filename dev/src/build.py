import os, shutil
from glob import glob
import json
import argparse
from jinja2 import Environment, FileSystemLoader
import frontmatter
from frontmatter.default_handlers import YAMLHandler
import re
import cmarkgfm

# config
src_dir = os.path.dirname(os.path.realpath(__file__))
root_dir = os.path.abspath(os.path.join(src_dir, "../.."))
os.chdir(root_dir)
dev_dir = os.path.relpath(os.path.join(root_dir, "dev"), root_dir)
content_dir = os.path.join(dev_dir, "content")
templates_dir = os.path.join(dev_dir, "templates")
components_dir = os.path.join(dev_dir, "components")
templates = Environment(loader=FileSystemLoader([templates_dir, components_dir]))

output_dir = os.path.relpath(os.path.join(root_dir, "docs"), root_dir)
output_styles_dir = os.path.join(output_dir, "resources", "styles")
output_scripts_dir = os.path.join(output_dir, "resources", "scripts")

# utilities
# map file type of frontmatter parser
handlers = {
    '.md': YAMLHandler(),
    # look for custom HTML comment <!--- ... ---> for frontmatter
    '.html': frontmatter.default_handlers.YAMLHandler(
        fm_boundary=re.compile("^(?:<!-{3,})|(?:-{3,}>)$", re.MULTILINE),
        start_delimiter="<!---",
        end_delimiter="--->",
    )
}

def get_filenames(files, src):
    return glob(os.path.join(src, files))

def write_page(page, name, subdir=""):
    page_path = os.path.join(output_dir, subdir, f"{name}.html")
    with open(page_path, "w") as f: 
        f.write(page)
    return page_path

def copy_stylehseet(path):
    if not path.endswith(".css"): 
        path += ".css"
    return shutil.copy2(path, output_styles_dir)

def copy_script(path):
    if not path.endswith(".js"): 
        path += ".js"
    return shutil.copy2(path, output_scripts_dir)

def copy_resources(page, style_src, script_src): 
    styles = page.metadata.get("styles", [])
    styles.append(page.get("style", None))
    scripts = page.metadata.get("scripts", [])
    scripts.append(page.get("script", None))
    resources = []
    for style in styles: 
        if style: 
            resources.append(copy_stylehseet(os.path.join(style_src, style)))
    for script in scripts: 
        if script:
            resources.append(copy_script(os.path.join(script_src, script)))
    return resources


# build pages from frontmatter objects and copy resources to docs
# TODO may want to template .css or .js to inject config variables
def build(files, template, src="", dst=None, handler="yaml", style_src=None, script_src=None, config={}):
    template = templates.get_template(f"{template}.html")
    dst = src if dst is None else dst
    src = os.path.join(content_dir, src)
    style_src = src if style_src is None else style_src
    script_src = src if script_src is None else script_src
    outputs = []
    for file in get_filenames(files, src): 
        name, ext = os.path.splitext(os.path.basename(file))
        page = frontmatter.load(file, handler=handlers[ext], name=name)
        render = template.render(content=page.content, config=config, **page.metadata)
        outputs.append(write_page(render, name, dst))
        outputs.extend(copy_resources(page, style_src, script_src))
    return outputs


if __name__=="__main__":
    # https://docs.python.org/3/howto/logging.html#logging-advanced-tutorial
    # import logging
    # logger = logging.getLogger(__name__)
    # logger.setLevel(logging.DEBUG)


    with open(os.path.join(dev_dir, "build_config.json"), "r") as f:
        build_config = json.load(f)
        config = build_config["config"]
        builds = build_config["builds"]

    # nav = templates.get_template('header/nav_basic.html'); render = nav.render(config=config); write_page(render, "test")

    for args in builds: 
        print('Build args:', args)
        for output in build(config=config, **args):
            print('    ', output)
