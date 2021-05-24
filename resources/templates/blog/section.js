module.exports = ({ node, opts }) => {
  const slevel = node.getLevel()
  const id = node.getId()
  const document = node.getDocument()
  let anchor = ''
  let link_start = ''
  let link_end = ''
  if (document.getAttribute('sectanchors')) {
    anchor = `<a class="anchor" href="#${id}"></a>`
  } else if (document.getAttribute('sectlinks')) {
    link_start = `<a class="link" href="#${id}">`
    link_end = '</a>'
  }
  const roles = ['sect2']
  if (node.getRole()) {
    roles.push(node.getRole())
  }
  const hlevel = 3
  return `<div class="${roles.join(' ')}">
<h${hlevel}${id ? ` id="${id}"` : ''}>${anchor}${link_start}${node.getCaptionedTitle()}${link_end}</h${hlevel}><br/>
${node.getContent()}
</div>`
}
