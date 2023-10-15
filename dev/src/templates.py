import os
import re
# processing metadata
import frontmatter
from frontmatter.default_handlers import YAMLHandler
# convert markdown to html
import cmarkgfm
from cmarkgfm.cmark import Options as cmarkgfmOptions
# html templates
from jinja2 import Environment, FileSystemLoader, pass_context
from markupsafe import Markup
from datetime import datetime, timezone

from filesystem import walk_dir
import json

# wrapper around frontmatter.Post to allow for custom handlers and content rendering
class Page:
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

    def __init__(self, file): 
        self.file = file
        self.name, ext = os.path.splitext(os.path.basename(file))
        handler = self.handlers[ext]
        page = frontmatter.load(file, handler=handler, name=self.name)
        self.metadata = page.metadata
        self.content = self.render_content(file, page)

    @staticmethod
    def render_content(file, page): 
        if file.endswith(".md"):
            return cmarkgfm.markdown_to_html(page.content, options=(
                cmarkgfmOptions.CMARK_OPT_UNSAFE | 
                cmarkgfmOptions.CMARK_OPT_FOOTNOTES | 
                cmarkgfmOptions.CMARK_OPT_SMART
            ))
        return page.content


# filter for rendering a render when a template renders into another template
@pass_context
def subrender(context, value): 
    template = context.environment.from_string(value)
    render = template.render(**context)
    if context.eval_ctx.autoescape:
        # https://jinja.palletsprojects.com/en/3.1.x/api/#evaluation-context
        render = Markup(render)
    return render

def get_projects(content_dir): 
    projects_dir = os.path.join(content_dir, "projects")
    default_index = 999
    _, project_dirs = walk_dir(projects_dir)
    projects = []
    for project in project_dirs: 
        # default values
        variables = {
            "title": project, 
            "index": default_index,
            "status": "???", 
            "description": "???",
            "tags": [], 
            "pages": [Page(f) for f in walk_dir(os.path.join(projects_dir, project))[0] if f.endswith(".md")],
        }
        variables_file = os.path.join(projects_dir, project, "variables.json")
        if os.path.isfile(variables_file):
            with open(variables_file, "r") as f:
                variables.update(json.load(f))
        else: 
            default_index += 1
        projects.append(variables)
    return sorted(projects, key=lambda i: i["index"])

def get_posts(): pass

def get_template_environment(templates_dirs, content_dir, **gvars):
    templates = Environment(loader=FileSystemLoader(templates_dirs))
    # attach globals and filters for use in templates
    templates.globals["nowutc"] = lambda: datetime.now(timezone.utc).strftime("%Y%m%dT%H:%M:%SZ%z")
    # TODO use globals for aggregations?: get_projects, get_posts, etc
    templates.globals["projects"] = get_projects(content_dir)
    for k,v in gvars.items(): 
        templates.globals[k] = v
    templates.filters["subrender"] = subrender
    return templates