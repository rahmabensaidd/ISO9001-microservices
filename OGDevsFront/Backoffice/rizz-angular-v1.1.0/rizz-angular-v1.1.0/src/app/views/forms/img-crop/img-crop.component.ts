import { CommonModule } from '@angular/common'
import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap'
import { AngularCropperjsModule, CropperComponent } from 'angular-cropperjs'
import Cropper from 'cropperjs'

interface CropperOptions {
  responsive: boolean
  restore: boolean
  checkCrossOrigin: boolean
  checkOrientation: boolean
  modal: boolean
  guides: boolean
  center: boolean
  highlight: boolean
  background: boolean
  autoCrop: boolean
  movable: boolean
  rotatable: boolean
  scalable: boolean
  zoomable: boolean
  zoomOnTouch: boolean
  zoomOnWheel: boolean
  cropBoxMovable: boolean
  cropBoxResizable: boolean
  toggleDragModeOnDblclick: boolean
}
@Component({
    selector: 'app-img-crop',
    imports: [
        AngularCropperjsModule,
        NgbDropdownModule,
        FormsModule,
        CommonModule,
        NgbTooltipModule,
    ],
    templateUrl: './img-crop.component.html',
    styles: ``
})
export class ImgCropComponent {
  @ViewChild('angularCropper') public angularCropper!: CropperComponent

  @ViewChild('putData') public putData!: ElementRef

  cropperData: any = {}
  viewMode: Cropper.ViewMode = 0
  image = document.getElementById('angularCropper')
  aspectRatio: number = 1.7777777

  updateCropData(event: Cropper.CropEvent) {
    this.cropperData = {
      x: event.detail.x,
      y: event.detail.y,
      width: event.detail.width,
      height: event.detail.height,
      rotate: event.detail.rotate,
      scaleX: event.detail.scaleX,
      scaleY: event.detail.scaleY,
    }
  }

  public cropperConfig: Cropper.Options = {
    aspectRatio: this.aspectRatio,
    preview: '.img-preview',
    zoomable: true,
    scalable: true,
    viewMode: this.viewMode,
    responsive: true,
    restore: true,
    checkCrossOrigin: true,
    checkOrientation: true,
    modal: true,
    guides: true,
    center: true,
    highlight: true,
    background: true,
    autoCrop: true,
    movable: true,
    rotatable: true,
    zoomOnTouch: true,
    zoomOnWheel: true,
    cropBoxMovable: true,
    cropBoxResizable: true,
    toggleDragModeOnDblclick: true,
    crop: (event: Cropper.CropEvent) => {
      this.updateCropData(event)
    },
  }
  constructor(private renderer: Renderer2) {}

  updateTextarea(data: any) {
    this.renderer.setProperty(
      this.putData.nativeElement,
      'value',
      JSON.stringify(data, null, 2)
    )
  }

  objectKeys(): (keyof CropperOptions)[] {
    return Object.keys(this.cropperConfig) as (keyof CropperOptions)[]
  }

  onOptionChange(option: keyof CropperOptions, event: Event) {
    const checkbox = event.target as HTMLInputElement
    this.cropperConfig[option] = checkbox.checked
    this.angularCropper.cropper.destroy()
    this.angularCropper.cropper = new Cropper(
      this.angularCropper.imageElement,
      this.cropperConfig
    )
  }

  zoom(ratio: number): void {
    this.angularCropper.cropper.zoom(ratio)
  }

  move(xOffset: number, yOffset: number): void {
    this.angularCropper.cropper.move(xOffset, yOffset)
  }

  rotate(degree: number): void {
    this.angularCropper.cropper.rotate(degree)
  }

  currentScaleX: number = 1
  scalex(): void {
    this.currentScaleX = -this.currentScaleX
    this.angularCropper.cropper.scaleX(this.currentScaleX)
  }

  currentScaleY: number = 1
  scaleY(): void {
    this.currentScaleY = -this.currentScaleY
    this.angularCropper.cropper.scaleY(this.currentScaleY)
  }

  clear(): void {
    this.angularCropper.cropper.clear()
  }

  crop(): void {
    this.angularCropper.cropper.crop()
  }

  disable(): void {
    this.angularCropper.cropper.disable()
  }

  enable(): void {
    this.angularCropper.cropper.enable()
  }

  reset(): void {
    this.angularCropper.cropper.reset()
  }

  destroy(): void {
    this.angularCropper.cropper.destroy()
  }
  getCanvasData() {
    const canvasData = this.angularCropper.cropper.getCanvasData()
    this.updateTextarea(canvasData)
  }

  getData() {
    const getData = this.angularCropper.cropper.getData()
    this.updateTextarea(getData)
  }

  setCanvasData(data: any) {
    this.angularCropper.cropper.setCanvasData(data)
    this.updateTextarea(data)
  }

  getContainerData() {
    const cropBoxData = this.angularCropper.cropper.getContainerData()
    this.updateTextarea(cropBoxData)
  }

  getImageData() {
    const imageData = this.angularCropper.cropper.getImageData()
    this.updateTextarea(imageData)
  }
  settCanvasData(data: any) {
    const setcanvas = this.angularCropper.cropper.setCanvasData(data)
    this.updateTextarea(setcanvas)
  }

  getCropBoxData() {
    const cropbox = this.angularCropper.cropper.getCropBoxData()
    this.updateTextarea(cropbox)
  }

  setCropBoxData(data: any) {
    const setcrop = this.angularCropper.cropper.setCropBoxData(data)
    this.updateTextarea(setcrop)
  }
  moveTo(xOffset: number, yOffset: number) {
    this.angularCropper.cropper.moveTo(xOffset, yOffset)
  }

  zoomTo(zoom: number) {
    this.angularCropper.cropper.zoomTo(zoom)
  }

  rotateTo(rotateTo: number) {
    this.angularCropper.cropper.rotateTo(rotateTo)
  }

  scaleTo(scaleTo: number) {
    this.angularCropper.cropper.scale(scaleTo)
  }

  ratio(aspectRatio: number) {
    this.aspectRatio = aspectRatio
    this.angularCropper.cropper.setAspectRatio(aspectRatio)
  }

  changeViewMode() {
    this.cropperConfig.viewMode = this.viewMode
    this.angularCropper.cropper.destroy()
    this.angularCropper.cropper = new Cropper(
      this.angularCropper.imageElement,
      this.cropperConfig
    )
  }
}
