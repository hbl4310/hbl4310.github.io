import os, shutil
import re
from jinja2 import Environment, FileSystemLoader, Template 
import frontmatter
import cmarkgfm


src_dir = os.path.dirname(os.path.realpath(__file__))
dev_dir = os.path.abspath(os.path.join(src_dir, ".."))
output_dir = os.path.abspath(os.path.join(dev_dir, "../docs"))
templates_dir = os.path.join(dev_dir, "templates")


templates = Environment(loader=FileSystemLoader(templates_dir))

# TODO make publishing config

def publish_frames(names, frames_dir = "parts"):
    # look for custom HTML comment <!--- ... ---> for frontmatter
    HTMLHandler = frontmatter.default_handlers.YAMLHandler(
        fm_boundary=re.compile("^(?:<!-{3,})|(?:-{3,}>)$", re.MULTILINE),
        start_delimiter="<!---",
        end_delimiter="--->",
    )
    default_metadata = {}
    frame_template = templates.get_template("frame.html")
    for name in names: 
        frame = frontmatter.load(os.path.join(frames_dir, f"{name}.html"), handler=HTMLHandler, name=name, **default_metadata)
        render = frame_template.render(content=frame.content, **frame.metadata)
        # write html, move css and js 
        with open(os.path.join(output_dir, "pages", "frames", f"{name}.html"), "w") as f: 
            f.write(render)
        if "style" in frame.metadata: 
            shutil.copy2(os.path.join(frames_dir, frame.metadata["style"]), os.path.join(output_dir, "resources", "styles"))
        if "script" in frame.metadata: 
            shutil.copy2(os.path.join(frames_dir, frame.metadata["script"]), os.path.join(output_dir, "resources", "scripts"))
    return


if __name__=="__main__":
    pass