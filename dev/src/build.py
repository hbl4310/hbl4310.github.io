import os
import json

from filesystem import \
    dev_dir, content_dir, styles_dir, scripts_dir, templates_dir, components_dir, output_dir, \
    walk_dir, check_src_path, get_filenames, get_relpath_content, \
    copy_includes, write_page, copy_page_resources
from templates import Page, get_template_environment
from interface import get_args


config_filename = "build_config.json"

def get_config():
    config_file = os.path.join(dev_dir, config_filename)
    with open(config_file, "r") as f:
        build_config = json.load(f)
        config = build_config["config"]
        includes = build_config["includes"]
        builds = build_config["builds"]
    return config, includes, builds


# build pages from frontmatter objects and copy resources to docs
def build(files, template, 
        src="", dst=None, common_src=False, 
        style_src=styles_dir, script_src=scripts_dir, 
        config=dict(),
        logger=None,
    ):
    template = templates.get_template(f"{template}.html")
    src = check_src_path(src)
    if common_src:
        style_src = src
        script_src = src
    else: 
        style_src = check_src_path(style_src)
        script_src = check_src_path(script_src)
    outputs = []
    for file in get_filenames(files, src): 
        page = Page(file)
        render = template.render(content=page.content, **page.metadata)
        output_subdir = get_relpath_content(file) if dst is None else dst
        outputs.append(write_page(render, page.name, output_subdir, logger=logger))
        outputs.extend(copy_page_resources(page, style_src, script_src, logger=logger))
    return outputs

def compare_output_files(old, new):
    oldset = set(old)
    newset = set(new)
    untouched = oldset.difference(newset)
    logger.info(f"{len(untouched)} untouched files")
    for f in untouched: 
        logger.debug(f)
    newfiles = newset.difference(oldset)
    logger.info(f"{len(newfiles)} new files")
    for f in newfiles: 
        logger.info(f)
    overwritten = newset.intersection(oldset)
    logger.info(f"{len(overwritten)} overwritten files")
    for f in overwritten: 
        logger.debug(f)


if __name__=="__main__":
    args, logger = get_args()
    config, includes, builds = get_config()
    templates = get_template_environment([templates_dir, components_dir], content_dir, config=config)

    existing_output_files, _ = walk_dir(output_dir)
    new_output_files = []
    
    logger.debug("moving global resources")
    new_output_files.extend(copy_includes(includes, logger=logger))

    for build_args in builds: 
        logger.info(f"build args: {build_args}")
        new_output_files.extend(build(logger=logger, **build_args))

    compare_output_files(existing_output_files, new_output_files)

    # nav = templates.get_template('header/nav_basic.html')
    # render = nav.render(config=config)
    # write_page(render, "test")