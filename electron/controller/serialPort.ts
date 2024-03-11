import { resolve } from "path"

const { SerialPort } = require('serialport')

export default class SerialConnect {
  // 连接状态
  private static connectState: boolean = false
  // 正确的下位机串口
  private static HardwarePort = {}
  // 连接硬件
  public static connectHardware = async () => {
    let portLists: Array<object> = []
    try {
      portLists = await SerialPort.list()
      // console.info(portLists)
    } catch (err) {
      console.info(err)
      return
    }
    if (portLists.length == 0) {
      console.info('no serial port')
      return
    }
    // 连接硬件端口
    let connectCount = 3
    while (!this.connectState && connectCount > 0) {
      console.info(connectCount)
      // 遍历测试硬件连接
      for (let i = 0; i < portLists.length; i++) {
        let port = new SerialPort({ path: portLists[i].path, baudRate: 115200 }, (err) => {
          if (err) {
            console.log('port open failed')
            return
          }
          console.log('port open success')
        })
        // port.write('Hello world!\n'); // 发送字符串
        // port.write(Buffer.from('Hey!\n')); // 发送Buffer数据
        // port.write(new Uint8Array([0x48, 0x69, 0x21, 0x0A])); //发送字节数组
        // 以 flowing mode 监听收到的数据
        port.on('error', (err) => {
          console.info(err)
        })
        port.on('data', (data) => {
          console.info(data, '---------------')
          this.HardwarePort = port
          // 连接成功
          this.connectState = true
          // 信息回调
        })
        port.write(new Uint8Array([0xaa, 0xbb, 0xcc]))
        port.drain((err) => {
          if (err) return
          console.info('send ok')
        })
        await new Promise(resolve => setTimeout(resolve, 500))
        connectCount --
        // 如果没有连接就关闭
        if(!this.connectState) {
          port.close(err => {
            if(err) 
              console.info('close failed')
            console.info('close success')
          })
        }
      }
    }
    if(this.connectState == true)
      console.info('connect success')
    else {
      console.info('no hardware input')
    }
  }
  // 发送数据
  public static sendMessage = (data: string) => {
    if(this.connectState && Object.keys(this.HardwarePort).length != 0) {
      this.HardwarePort?.write(Buffer.from(data))
      this.HardwarePort?.drain((err) => {
        if (err) return
        console.info('send ok')
      })
    }
  }
}
