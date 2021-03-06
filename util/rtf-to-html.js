'use strict'
const promisify = use('promisify')
const rtfToHTML = promisify(require('@iarna/rtf-to-html').fromString)

module.exports = rtf => rtfToHTML(rtf).then(html => {
  return html.replace(/<[/](\w+)><\1>/g, '')
})
