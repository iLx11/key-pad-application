import { resolve } from 'path'

const { SerialPort } = require('serialport')

export default class SerialConnect {
  private static wait = null
  // 等待状态
  private static waitState: boolean = false
  // 连接状态
  private static connectState: boolean = false
  // 正确的下位机串口
  private static HardwarePort = {}
  // 连接硬件
  public static connectHardware = async (): Promise<boolean> => {
    let portLists: Array<object> = []
    try {
      portLists = await SerialPort.list()
      // console.info(portLists)
    } catch (err) {
      console.info(err)
      this.connectState = false
      return new Promise(resolve => resolve(false))
    }
    if (portLists.length == 0) {
      console.info('no serial port')
      this.connectState = false
      return new Promise(resolve => resolve(false))
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
            this.connectState = false
            return new Promise(resolve => resolve(false))
          }
          console.log('port open success')
        })
        // port.write('Hello world!\n'); // 发送字符串
        // port.write(Buffer.from('Hey!\n')); // 发送Buffer数据
        // port.write(new Uint8Array([0x48, 0x69, 0x21, 0x0A])); //发送字节数组
        // 以 flowing mode 监听收到的数据
        port.on('error', (err) => {
          console.info(err)
          this.connectState = false
          return new Promise(resolve => resolve(false))
        })
        // 数据监听
        port.on('data', (buff) => {
          // 硬件应答连接
          if (buff[0] == 0xaa && buff[1] == 0xbb && buff[2] == 0xcc) {
            this.HardwarePort = port
            // 连接成功
            this.connectState = true
          }
          // 处理数据
          this.dataHandle(buff)
        })
        // 窗口关闭监听
        port.on('close', () => {
          this.connectState = false
          return new Promise(resolve => resolve(false))
        })
        port.write(new Uint8Array([0xaa, 0xbb, 0xcc]))
        port.drain((err) => {
          if (err)  {
            this.connectState = false
            return new Promise(resolve => resolve(false))
          }
          console.info('send ok')
        })
        await new Promise((resolve) => setTimeout(resolve, 500))
        connectCount--
        // 如果没有连接就关闭
        if (!this.connectState) {
          port.close((err) => {
            if (err) console.info('close failed')
            this.connectState = false
            console.info('close success')
          })
        }
      }
    }
    if (this.connectState == true)  {
      console.info('connect success') 
      return new Promise(resolve => resolve(true) )
    } else {
      console.info('no hardware input')
      return new Promise(resolve => resolve(false) )
    }
  }
  // 发送数据
  public static sendData = async (data: string): Promise<boolean> => {
    if (this.connectState && Object.keys(this.HardwarePort).length != 0) {
      this.HardwarePort?.write(Buffer.from(data))
      this.HardwarePort?.drain((err) => {
        if (err) return new Promise(resolve => resolve(false))
        return new Promise(resolve => resolve(true))
      })
      return new Promise(resolve => resolve(true))
    }
    return new Promise(resolve => resolve(false))
  }
  // 数据处理
  private static dataHandle = (buff: Buffer) => {
    if(buff[0] == 0x68) {
      this.waitState = true
    }
    // console.info(buff[0] == 0x68)
  }
  // 等待回应
  public static waitSign = async ():Promise<boolean> => {
    await new Promise(resolve => {
      if(this.wait) return
       this.wait = setInterval(() => {
        if(this.waitState) {
          clearInterval(this.wait)
          this.wait = null
          resolve(this.waitState)
          this.waitState = false
        }
      }, 2) 
    }).catch(() => {
      return new Promise(resolve => resolve(false))
    })
    return new Promise(resolve => resolve(true))
  }
}
