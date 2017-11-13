/*
 The MIT License (MIT)

 Copyright (c) 2017 Stefano Cappa (Ks89)

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

import { Input, Output, EventEmitter, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import {
  ButtonConfig, ButtonEvent, ButtonsConfig, ButtonSize,
  ButtonsStrategy, ButtonType
} from '../../interfaces/buttons-config.interface';
import { Image } from '../../interfaces/image.class';

export interface InternalButtonConfig extends ButtonConfig {
  id?: number; // useful only for trackById, not needed by users
}

/**
 * Component with all upper right buttons.
 * In fact, it uses a template with extUrl, download and close buttons with the right directive.
 * Also it emits click events as outputs.
 */
@Component({
  selector: 'ks-upper-buttons',
  styleUrls: ['upper-buttons.scss'],
  templateUrl: 'upper-buttons.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpperButtonsComponent implements OnInit {

  private static SPACE_KEY = 32;
  private static ENTER_KEY = 13;
  private static MOUSE_MAIN_BUTTON_CLICK = 0;

  @Input() image: Image;
  @Input() buttonsConfig: ButtonsConfig;

  @Output() refresh: EventEmitter<ButtonEvent> = new EventEmitter<ButtonEvent>();
  @Output() delete: EventEmitter<ButtonEvent> = new EventEmitter<ButtonEvent>();
  @Output() navigate: EventEmitter<ButtonEvent> = new EventEmitter<ButtonEvent>();
  @Output() download: EventEmitter<ButtonEvent> = new EventEmitter<ButtonEvent>();
  @Output() close: EventEmitter<ButtonEvent> = new EventEmitter<ButtonEvent>();
  @Output() customOutput: EventEmitter<ButtonEvent> = new EventEmitter<ButtonEvent>();

  buttons: InternalButtonConfig[];

  private defaultSize: ButtonSize = {height: 30, width: 30, unit: 'px'};

  private simpleButtonsDefault: ButtonConfig[] = [{
    className: 'close-image',
    size: this.defaultSize,
    type: ButtonType.CLOSE,
    title: 'Close this modal image gallery',
    ariaLabel: 'Close this modal image gallery'
  }];

  private advancedButtonsDefault: ButtonConfig[] = [
    {
      className: 'ext-url-image',
      size: this.defaultSize,
      type: ButtonType.EXTURL,
      title: 'Navigate the current image',
      ariaLabel: 'Navigate the current image'
    },
    {
      className: 'download-image',
      size: this.defaultSize,
      type: ButtonType.DOWNLOAD,
      title: 'Download the current image',
      ariaLabel: 'Download the current image'
    },
    ...this.simpleButtonsDefault
  ];

  private fullButtonsDefault: ButtonConfig[] = [
    {
      className: 'refresh-image',
      size: this.defaultSize,
      type: ButtonType.REFRESH,
      title: 'Refresh all images',
      ariaLabel: 'Refresh all images'
    },
    {
      className: 'delete-image',
      size: this.defaultSize,
      type: ButtonType.DELETE,
      title: 'Delete the current image',
      ariaLabel: 'Delete the current image'
    },
    ...this.advancedButtonsDefault
  ];

  ngOnInit() {
    if (!this.buttonsConfig || !this.buttonsConfig.strategy) {
      throw new Error(`ButtonsConfig's strategy is a mandatory field`);
    }

    switch (this.buttonsConfig.strategy) {
      case ButtonsStrategy.SIMPLE:
        this.buttons = this.addButtonIds(this.simpleButtonsDefault);
        break;
      case ButtonsStrategy.ADVANCED:
        this.buttons = this.addButtonIds(this.advancedButtonsDefault);
        break;
      case ButtonsStrategy.FULL:
        this.buttons = this.addButtonIds(this.fullButtonsDefault);
        break;
      case ButtonsStrategy.CUSTOM:
        this.buttons = this.addButtonIds(this.initCustomButtons());
        break;
      case ButtonsStrategy.DEFAULT:
      default:
        this.buttons = this.addButtonIds(this.simpleButtonsDefault);
        break;
    }
  }

  onEvent(button: InternalButtonConfig, index: number, event: KeyboardEvent | MouseEvent) {
    console.log('onEvent index: ' + index + ', button:', button);
    console.log('onEvent event:', event);
    switch (button.type) {
      case ButtonType.REFRESH:
        this.triggerOnMouseAndKeyboard(this.refresh, event, button, index, true);
        break;
      case ButtonType.DELETE:
        this.triggerOnMouseAndKeyboard(this.delete, event, button, index, true);
        break;
      case ButtonType.EXTURL:
        if (!this.image || !this.image.extUrl) {
          return;
        }
        this.triggerOnMouseAndKeyboard(this.navigate, event, button, index, this.image.extUrl);
        break;
      case ButtonType.DOWNLOAD:
        this.triggerOnMouseAndKeyboard(this.download, event, button, index, true);
        break;
      case ButtonType.CLOSE:
        this.triggerOnMouseAndKeyboard(this.close, event, button, index, true);
        break;
      case ButtonType.CUSTOM:
        this.triggerOnMouseAndKeyboard(this.customOutput, event, button, index, true);
        break;
    }
  }

  trackById(index: number, item: InternalButtonConfig) {
    return item.id;
  }

  private addButtonIds(buttons: ButtonConfig[]) {
    return buttons.map((val: ButtonConfig, i: number) => {
      const btn: InternalButtonConfig = Object.assign({}, val);
      btn.id = i;
      return btn;
    });
  }

  private initCustomButtons(): ButtonConfig[] {
    const buttonsConfig: ButtonsConfig = Object.assign({}, this.buttonsConfig);
    buttonsConfig.buttons = buttonsConfig.buttons || [];

    console.log('init custom: ', buttonsConfig);

    this.buttons = buttonsConfig.buttons.map((btn: ButtonConfig) => {
      const button: ButtonConfig = Object.assign({}, btn);
      console.log('mapping button: ', button);

      // switch (button.type) {
      //   case ButtonType.REFRESH:
      //     // button.className = 'refresh-image';
      //     break;
      //   case ButtonType.DELETE:
      //     // button.className = 'delete-image';
      //     break;
      //   case ButtonType.EXTURL:
      //     // button.className = 'ext-url-image';
      //     break;
      //   case ButtonType.DOWNLOAD:
      //     // button.className = 'download-image';
      //     break;
      //   case ButtonType.CLOSE:
      //     // button.className = 'close-image';
      //     break;
      //   case ButtonType.CUSTOM:
      //     // button.className = 'close-image';
      //     break;
      //   default:
      //     button.className = 'unknown-image'; // TODO add this class to scss
      //     break;
      // }
      console.log('mapped button: ', button);
      return button;
    });
    console.log('returning this.buttons: ', this.buttons);
    return this.buttons;
  }


  private triggerOnMouseAndKeyboard(emitter: EventEmitter<ButtonEvent>,
                                    event: KeyboardEvent | MouseEvent,
                                    btnSource: ButtonConfig,
                                    btnIndex: number,
                                    data: any) {
    const dataToEmit: ButtonEvent = {
      index: btnIndex,
      button: btnSource,
      payload: data
    };

    console.log('triggerOnMouseAndKeyboard dataToEmit', dataToEmit);

    if (event instanceof KeyboardEvent && event) {
      const key: number = event.keyCode;

      if (key === UpperButtonsComponent.SPACE_KEY || key === UpperButtonsComponent.ENTER_KEY) {
        emitter.emit(dataToEmit);
        return;
      }
    }

    if (event instanceof MouseEvent && event) {
      const mouseBtn: number = event.button;

      if (mouseBtn === UpperButtonsComponent.MOUSE_MAIN_BUTTON_CLICK) {
        emitter.emit(dataToEmit);
      }
    }
  }
}