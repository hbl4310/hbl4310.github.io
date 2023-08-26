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
styles_dir = os.path.join(dev_dir, "styles")
scripts_dir = os.path.join(dev_dir, "scripts")
templates_dir = os.path.join(dev_dir, "templates")
components_dir = os.path.join(dev_dir, "components")
templates = Environment(loader=FileSystemLoader([templates_dir, components_dir]))
config_filename = "build_config.json"
config_file = os.path.join(dev_dir, config_filename)

output_dir = os.path.relpath(os.path.join(root_dir, "docs"), root_dir)
output_styles_dir = os.path.join(output_dir, "resources", "styles")
output_scripts_dir = os.path.join(output_dir, "resources", "scripts")

def get_config():
    with open(config_file, "r") as f:
        build_config = json.load(f)
        config = build_config["config"]
        includes = build_config["includes"]
        builds = build_config["builds"]
    return config, includes, builds

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

def check_path(path, throw_error = False): 
    dir = os.path.dirname(path)
    if os.path.exists(path): 
        return True
    if throw_error: 
        raise NotADirectoryError(path)
    os.makedirs(dir)
    return False

def write_page(page, name, subdir=""):
    page_path = os.path.join(output_dir, subdir, f"{name}.html")
    msg = ""
    if not check_path(page_path): 
        msg += "created directory and "
    with open(page_path, "w") as f: 
        f.write(page)
    msg += f"generated page: {page_path}"
    return msg

def try_copy(src, dst): 
    if os.path.isfile(src): 
        return f"moved resource: {shutil.copy2(src, dst)}"
    return f"[WARN] could not locate {src} to copy to {dst}"

def copy_stylehseet(path):
    if not path.endswith(".css"): 
        path += ".css"
    return try_copy(path, output_styles_dir)

def copy_script(path):
    if not path.endswith(".js"): 
        path += ".js"
    return try_copy(path, output_scripts_dir)

def copy_page_resources(page, style_src, script_src): 
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

def copy_includes(includes):
    outputs = []
    for style in includes["styles"]:
        outputs.append(copy_stylehseet(os.path.join(styles_dir, style)))
    for script in includes["scripts"]:
        outputs.append(copy_script(os.path.join(scripts_dir, script)))
    return outputs

# build pages from frontmatter objects and copy resources to docs
# TODO may want to template .css or .js to inject config variables
def build(files, template, src="", dst=None, style_src=styles_dir, script_src=scripts_dir, config={}):
    template = templates.get_template(f"{template}.html")
    dst = src if dst is None else dst
    src = os.path.join(content_dir, src)
    outputs = []
    for file in get_filenames(files, src): 
        name, ext = os.path.splitext(os.path.basename(file))
        page = frontmatter.load(file, handler=handlers[ext], name=name)
        render = template.render(content=page.content, config=config, **page.metadata)
        outputs.append(write_page(render, name, dst))
        outputs.extend(copy_page_resources(page, style_src, script_src))
    return outputs


if __name__=="__main__":
    # https://docs.python.org/3/howto/logging.html#logging-advanced-tutorial
    # import logging
    # logger = logging.getLogger(__name__)
    # logger.setLevel(logging.DEBUG)

    config, includes, builds = get_config()

    print("Moving global resources:")
    for output in copy_includes(includes):
        print("\t"+output)

    for args in builds: 
        print("Build args:", args)
        for output in build(config=config, **args):
            print("\t"+output)

    # nav = templates.get_template('header/nav_basic.html')
    # render = nav.render(config=config)
    # write_page(render, "test")
