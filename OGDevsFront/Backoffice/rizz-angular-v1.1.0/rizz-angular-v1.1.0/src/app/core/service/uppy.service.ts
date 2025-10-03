import { Injectable } from '@angular/core'
import Uppy, { Uppy as UppyType } from '@uppy/core'
import Dashboard from '@uppy/dashboard'
import DragDrop from '@uppy/drag-drop'
import Tus from '@uppy/tus'
import { set, lensProp, compose, reduce, __ } from 'ramda'

@Injectable({
  providedIn: 'root',
})
export class UppyService {
  configure(pluginConfig: [string, any][], uuid: string): UppyType {
    const pluginMap: { [key: string]: any } = {
      Dashboard,
      DragDrop,
      Tus,
    }

    const plugins: [any, any][] = pluginConfig.map(([plugin, conf]) => {
      const config =
        plugin === 'Dashboard' && conf.target
          ? set(lensProp('target'), document.querySelector(conf.target), conf)
          : conf

      return [pluginMap[plugin], config]
    })

    const addPlugin = (uppy: UppyType, [plugin, conf]: [any, any]) =>
      uppy.use(plugin, conf)

    const uppyInstance = compose(
      reduce(addPlugin, __ as any, plugins),
      () => new Uppy({ autoProceed: false })
    )()

    return uppyInstance as UppyType
  }
}
