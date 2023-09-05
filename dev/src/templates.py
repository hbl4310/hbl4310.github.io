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

def get_projects(): 
    return ["this", "dadventures"]

def get_posts(): pass

def get_template_environment(templates_dirs, **gvars):
    templates = Environment(loader=FileSystemLoader(templates_dirs))
    # attach globals and filters for use in templates
    templates.globals["nowutc"] = lambda: datetime.now(timezone.utc).strftime("%Y%m%dT%H:%M:%SZ%z")
    # TODO use globals for aggregations?: get_projects, get_posts, etc
    # TODO replace walk_dir with get_projects
    templates.globals["projects"] = get_projects()
    for k,v in gvars.items(): 
        templates.globals[k] = v
    templates.filters["subrender"] = subrender
    return templates