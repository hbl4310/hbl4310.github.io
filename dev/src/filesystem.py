import os, sys, shutil
from glob import glob

# paths
src_dir = os.path.dirname(os.path.realpath(__file__))
root_dir = os.path.abspath(os.path.join(src_dir, "../.."))
os.chdir(root_dir)
dev_dir = os.path.relpath(os.path.join(root_dir, "dev"), root_dir)
content_dir = os.path.join(dev_dir, "content")
styles_dir = os.path.join(dev_dir, "styles")
scripts_dir = os.path.join(dev_dir, "scripts")
templates_dir = os.path.join(dev_dir, "templates")
components_dir = os.path.join(dev_dir, "components")

output_dir = os.path.relpath(os.path.join(root_dir, "docs"), root_dir)
output_styles_dir = os.path.join(output_dir, "resources", "styles")
output_scripts_dir = os.path.join(output_dir, "resources", "scripts")

# path finding
def get_filenames(files, src):
    if isinstance(files, str): 
        return glob(os.path.join(src, files))
    elif isinstance(files, list): 
        return [fn for f in files for fn in get_filenames(f, src)]
    raise TypeError(f"Can only get file names from strings or lists. Received: {files}")

def walk_dir(src):
    files = []
    subdirs = []
    for (dirpath, dirnames, filenames) in os.walk(src):
        files.extend([os.path.join(dirpath, x) for x in filenames])
        subdirs.extend(dirnames)
    return files, subdirs

def check_path(path, logger=None, throw_error=False): 
    dir = os.path.dirname(path)
    if not os.path.exists(dir): 
        if throw_error: 
            raise NotADirectoryError(dir)
        logger and logger.info("creating directory: "+dir)
        os.makedirs(dir)
    return path.replace(os.sep+"."+os.sep, os.sep)

def check_src_path(src):
    # all src paths should be subpaths of dev_dir
    if not src.startswith(dev_dir):
        return os.path.join(content_dir, src)
    return src

def get_relpath_content(path):
    return os.path.relpath(os.path.dirname(path), content_dir)

# writing and copying files
def write_page(page, name, subdir="", logger=None):
    page_path = check_path(os.path.join(output_dir, subdir, f"{name}.html"), logger=logger)
    with open(page_path, "w") as f: 
        f.write(page)
    logger and logger.debug("generated page: "+page_path)
    return page_path

def try_copy(src, dst, logger=None): 
    if os.path.isfile(src): 
        logger and logger.debug(f"copying {src} to {dst}")
        return shutil.copy2(src, dst)
    logger and logger.warning(f"could not locate {src} to copy to {dst}")
    return ""

def copy_stylehseet(path, logger=None):
    if not path.endswith(".css"): 
        path += ".css"
    return try_copy(path, output_styles_dir, logger=logger)

def copy_script(path, logger=None):
    if not path.endswith(".js"): 
        path += ".js"
    return try_copy(path, output_scripts_dir, logger=logger)

def copy_page_resources(page, style_src, script_src, logger=None): 
    styles = page.metadata.get("styles", [])
    styles.extend(page.metadata.get("extra_styles", []))
    styles.append(page.metadata.get("style", None))
    scripts = page.metadata.get("scripts", [])
    scripts.extend(page.metadata.get("extra_scripts", []))
    scripts.append(page.metadata.get("script", None))
    resources = []
    for style in styles: 
        if style: 
            resources.append(copy_stylehseet(os.path.join(style_src, style), logger=logger))
    for script in scripts: 
        if script:
            resources.append(copy_script(os.path.join(script_src, script), logger=logger))
    return resources

def copy_includes(includes, logger=None):
    outputs = []
    for style in includes["styles"]:
        outputs.append(copy_stylehseet(os.path.join(styles_dir, style), logger=logger))
    for script in includes["scripts"]:
        outputs.append(copy_script(os.path.join(scripts_dir, script), logger=logger))
    return outputs
