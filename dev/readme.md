# python static site generation
Example usage: `python src/build.py -l debug`

## structure: 

src/build.py
    script for site generation

templates/
    jinja2 templates for various pages

components/
    parts used in templates, like svg icons

content/ 
    content to fill templates

### TODO
- make posts/projects index page
- this content 
- md to html packages like https://github.com/trentm/python-markdown2 ? better documentation on extra options
- link anchors target="_blank" to open in new tab?



Notes: 
- Generate requirements.txt: `pipreqs --force .`
- Run development server: `livereload ./docs/`
- Markdown syntax: <https://www.markdownguide.org/basic-syntax/>