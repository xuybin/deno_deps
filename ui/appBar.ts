import { Component } from '../nano_jsx.ts'
import { h } from '../nano_jsx.ts'
import { boxShadow, zIndex } from './_config.ts'

const classes = {
  container: 'appBar_container',
  scrollingDown: 'appBar_scrolling_down'
}

interface AppBarProps {
  maxWidth?: number
  autoHide?: boolean
  autoMerge?: boolean
  background?: string
  color?: string
}

export class AppBar extends Component<AppBarProps> {
  curr_scrollY = 0
  last_scrollY = 0
  curr_scrollingState = 'none'
  last_scrollingState = 'none'
  container!: HTMLElement;

  calcScrollPosition() {
    this.curr_scrollY = window.scrollY

    if (this.curr_scrollY > this.last_scrollY) {
      this.curr_scrollingState = 'down'
    } else if (this.curr_scrollY < this.last_scrollY) {
      this.curr_scrollingState = 'up'
    }

    this.last_scrollY = this.curr_scrollY
  }

  scroll() {
    this.calcScrollPosition()

    if (this.curr_scrollY < 1) {
      this.container.classList.remove('appBar_scrolling_down')
    } else if (this.last_scrollingState !== this.curr_scrollingState) {
      this.last_scrollingState = this.curr_scrollingState

      if (this.curr_scrollingState === 'down') this.container.classList.add('appBar_scrolling_down')
      else this.container.classList.remove('appBar_scrolling_down')
    }
  }

  merge() {
    this.calcScrollPosition()

    if (this.curr_scrollY <= 1) {
      this.container.classList.add('appBar_merged')
    } else {
      this.container.classList.remove('appBar_merged')
    }
  }

  didMount() {
    this.curr_scrollY = this.last_scrollY = window.scrollY

    if (this.props.autoHide) addEventListener('scroll', () => this.scroll())
    if (this.props.autoMerge) addEventListener('scroll', () => this.merge())
  }

  didUnmount() {
    if (this.props.autoHide) removeEventListener('scroll', this.scroll)
    if (this.props.autoMerge) removeEventListener('scroll', () => this.merge())
  }

  render() {
    const { background = '#6200EE', color = 'white' } = this.props

    const styles = `
    .appBar_container {
      background: ${background};
      color: ${color};
      font-weight: 500;

      z-index: ${zIndex.bar}

      position: fixed;
      top: 0;
      left: 0;
      min-height: 24px;
      width: 100vw;


      ${boxShadow}

      transition: top 0.2s, -webkit-box-shadow 0.5s, -moz-box-shadow 0.5s, box-shadow 0.5s;
    }

    .appBar_container.appBar_scrolling_down {
      top: -56px;
    }

    .appBar_container.appBar_merged {
      -webkit-box-shadow: none;
      -moz-box-shadow: none;
      box-shadow: none;
    }

    .appBar_container .toolbar_container {
      display: flex;
      justify-content: space-between;
    }

    .appBar_container .toolbar_container,
    .appBar_container .tabs_container {
      margin: 0 auto;
      ${this.props.maxWidth ? `max-width: ${this.props.maxWidth}px;` : ''}
    }

    .appBar_container .toolbar_container .toolbar_left,
    .appBar_container .toolbar_container .toolbar_right {
      display: flex;
      align-items: center;      
    }

    .appBar_container .toolbar_container .toolbar_left {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .appBar_container .toolbar_title {
      font-size: 20px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    `

    document.head.appendChild(h('style', {}, styles))

    const mergedClass = this.props.autoMerge ? 'appBar_merged' : ''

    // @ts-ignore d
    this.container = h('div', { class: `${classes.container} ${mergedClass}` }, this.props.children)

    return this.container
  }
}
