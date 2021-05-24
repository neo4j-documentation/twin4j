module.exports = ({ node, opts }) => {
  const hasChecklist = node.isOption('checklist')
  if (hasChecklist) {
    const hasInteractive = node.isOption('interactive')
    if (hasInteractive) {
      marker_checked = '<input type="checkbox" data-item-complete="1" checked>'
      marker_unchecked = '<input type="checkbox" data-item-complete="0">'
    } else {
      if (node.getDocument().isAttribute('icons', 'font')) {
        marker_checked = '<i class="icon-check"></i>'
        marker_unchecked = '<i class="icon-check-empty"></i>'
      } else {
        marker_checked = '&#10003;'
        marker_unchecked = '&#10063;'
      }
    }
  }
  const id = node.getId()
  const roles = ['ulist']
  if (hasChecklist) {
    roles.push('checklist')
  }
  if (node.getStyle()) {
    roles.push(node.getStyle())
  }
  if (node.getRole()) {
    roles.push(node.getRole())
  }
  let titleHtml = ''
  if (node.hasTitle()) {
    titleHtml = `<div class="title">${node.getTitle()}</div>`
  }
  let listRole
  if (hasChecklist) {
    listRole = 'checklist'
  } else {
    listRole = node.getStyle()
  }
  const itemsHtml = node.getItems().map((item) => {
    let content
    if (hasChecklist && item.hasAttribute('checkbox')) {
      const marker = item.hasAttribute('checked') ? marker_checked : marker_unchecked
      content = `${marker} ${item.getText()}`
    } else {
      content = item.getText()
    }
    if (item.hasBlocks()) {
      return `<li>${content}${item.getContent()}</li>`
    }
    return `<li>${content}</li>`
  })
  return `<div${id ? ` id="${id}"` : ''} class="${roles.join(' ')}">
${titleHtml}
<ul${listRole ? ` class="${listRole}"` : ''}>
${itemsHtml.join('\n')}
</ul>
</div>`
}
