'use strict'

import React, {PureComponent} from 'react'
import ConnectionSelectorContainer from './components/ConnectionSelectorContainer'
import DatabaseContainer from './components/DatabaseContainer'
import Modal from '../../components/InstanceContent/components/Modal'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

class InstanceContent extends PureComponent {
  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {
    window.showModal = modal => {
      this.activeElement = document.activeElement
      this.setState({modal})

      this.callbacks = []
      const obj = {
        then: (callback) => {
          this.callbacks.push(['then', callback])
          return obj
        },
        catch: (callback) => {
          this.callbacks.push(['catch', callback])
          return obj
        }
      }
      return obj
    }
  }

  submit(result) {
    let promise = Promise.resolve(result)
    for(let i = 0; i < this.callbacks.length; i++) {
      let callback = this.callbacks[i]
      promise = promise[callback[0]]((...args) => callback[1](...args))
    }
    return promise
  }
  modalSubmit(result) {
    // 使用模拟的 promise，then 可以回调多次
    // 添加 key 失败（The key already exists）时，弹窗不取消
    this.submit(result).then(() => {
      this.setState({modal: null})
      if (this.activeElement) {
        this.activeElement.focus()
      }
    })
  }

  modalCancel() {
    this.setState({modal: null})
    if (this.activeElement) {
      this.activeElement.focus()
    }
  }

  componentWillUnmount() {
    delete window.showModal
  }

  render() {
    const {instances, activeInstanceKey} = this.props
    const contents = instances.map(instance => (
      <div
        key={instance.get('key')}
        style={{display: instance.get('key') === activeInstanceKey ? 'block' : 'none'}}
        >
        {
        instance.get('redis')
          ? <DatabaseContainer instance={instance}/>
          : <ConnectionSelectorContainer instance={instance}/>
      }
      </div>
    ))

    return (
      <div className="main">
        <ReactCSSTransitionGroup
          transitionName="modal"
          transitionEnterTimeout={150}
          transitionLeaveTimeout={150}
          >
          {
          this.state.modal &&
          <Modal
            key="modal"
            {...this.state.modal}
            onSubmit={this.modalSubmit.bind(this)}
            onCancel={this.modalCancel.bind(this)}
            />
        }
        </ReactCSSTransitionGroup>
        {contents}
      </div>
    )
  }
}

export default InstanceContent
