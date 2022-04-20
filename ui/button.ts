import { h, strToHash } from '../nano_jsx.ts'
import { boxShadow, rippleEffect, userSelect, zIndex } from './_config.ts'
import { addStylesToHead, lightenColor } from './_helpers.ts'
import { Icon } from './icon.ts'

export const Button = (props: {
  outlined?: boolean
  text?: boolean
  style?: string
  icon?: string
  // deno-lint-ignore no-explicit-any
  [key: string]: any
}) => {
  const {
    children,
    outlined = false,
    text = false,
    background = '#6200ee',
    color = '#ffffff',
    style = '',
    class: className = '',
    icon,
    ...rest
  } = props

  const normal = !(outlined || text)

  const bg = normal ? background : '#ffffff'
  const clr = normal ? color : background
  const hoverClr = normal ? lightenColor(bg, 10) : lightenColor(bg, -10)
  const rippleClr = normal ? lightenColor(bg, 50) : lightenColor(background, 50)
  const cssHash = strToHash(outlined.toString() + text.toString() + bg + clr + style)

  const ripple = rippleEffect(rippleClr, hoverClr)

  const styles = `
    .nano_jsx_button-${cssHash} {
      color: ${clr};
      background: ${bg};
      border-radius: 4px;
      display: inline-flex;
      font-size: 14px;
      padding: 10px 16px;
      margin: 0px 0px 1em 0px;
      text-align: center;
      cursor: pointer;

      ${userSelect}
      

      z-index: ${zIndex.button}

      ${boxShadow}

      border: none;
      text-transform: uppercase;
      box-shadow: 0 0 4px #999;
      outline: none;
    }

    ${ripple.styles}
  `

  addStylesToHead(styles, cssHash)

  let customStyles = ''
  if (outlined || text) {
    customStyles += 'padding-top: 9px; padding-bottom: 9px; '
    customStyles += '-webkit-box-shadow: none; -moz-box-shadow: none; box-shadow none; '
    if (outlined) customStyles += `border: 1px ${clr} solid; `
  }
  customStyles += style

  return h(
    'button',
    { class: `nano_jsx_button-${cssHash} ${ripple.class} ${className}`, style: customStyles, ...rest },
    icon ? h(Icon, { style: 'margin-left: -4px; margin-right: 8px; width: 14px; height: 14px;' }, icon) : null,
    children
  )
}
