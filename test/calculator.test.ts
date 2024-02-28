import { Calculator, CalculatorOptions } from './../src/index'
import { messages } from './../src/config'
const { invalidIP, invalidMask, invalidIPorMask } = messages
import calc from './../src/index'

describe('Calculator', () => {
  let calculator: Calculator
  let options: CalculatorOptions

  beforeEach(() => {
    calculator = new Calculator()
    options = { ip: '', mask: 0 }
  })

  describe('Constructor', () => {
    it('should create a new Calculator instance', () => {
      expect(calc()).toBeInstanceOf(Calculator)
    })

    it('should create a new Calculator instance with an empty options', () => {
      expect(calc({})).toBeInstanceOf(Calculator)
    })

    it('should create a new Calculator instance with undefined options', () => {
      expect(calc({ ip: undefined, mask: undefined })).toBeInstanceOf(Calculator)
    })

    it('should create a new Calculator instance with undefied mask', () => {
      expect(calc({ ip: '192.168.1.1', mask: undefined })).toBeInstanceOf(Calculator)
    })

    it('should create a new Calculator instance with undefined ip', () => {
      expect(calc({ ip: undefined, mask: '24' })).toBeInstanceOf(Calculator)
    })
  })

  describe('setIp', () => {
    it('should set the IP address and validate it', () => {
      options.ip = '192.168.1.1'
      const clc = calc({ mask: '24' }).setIp(options.ip).calculate()
      expect(clc.ip).toEqual(options.ip)
    })

    it('should throw an error for an invalid IP address', () => {
      options.ip = '192.168.1.300'
      expect(() => calculator.setIp(options.ip)).toThrow(invalidIP)
    })

    it('should throw an error for an invalid IP address with multiple dots', () => {
      options.ip = '192.168.1.300.1'
      expect(() => calculator.setIp(options.ip)).toThrow(invalidIP)
    })
  })

  describe('setMask', () => {
    it('should set the mask as a number and validate it', () => {
      options.mask = 24
      calculator.setMask(options.mask).calculate()
      expect(calculator.mask).toEqual(options.mask.toString())
    })

    it('should set the mask as a string and validate it', () => {
      options.mask = '24'
      calculator.setMask(options.mask).calculate()
      expect(calculator.mask).toEqual(options.mask.toString())
    })

    it('should throw an error for an invalid mask', () => {
      expect(() => calculator.setMask(-1)).toThrow(invalidMask)
    })
  })

  describe('calculate', () => {
    it('should calculate the network properties', () => {
      options.ip = '192.168.1.1'
      options.mask = 24
      calculator.setIp(options.ip).setMask(options.mask).calculate()
      expect(calculator.network).toEqual('192.168.1.0')
      expect(calculator.netmask).toEqual('255.255.255.0')
      expect(calculator.broadcast).toEqual('192.168.1.255')
      expect(calculator.wildcard).toEqual('0.0.0.255')
      expect(calculator.hostMin).toEqual('192.168.1.1')
      expect(calculator.hostMax).toEqual('192.168.1.254')
      expect(calculator.ipv4Class).toEqual('C')
      expect(calculator.maxHosts).toEqual('254')
      expect(calculator.maxNetworks).toEqual('16777216')
    })

    it('should calculate the network properties of a class A, B, C, D, E network', () => {
      const cls = {
        A: { ip: '10.0.0.1', mask: '255.0.0.0' },
        B: { ip: '172.16.0.1', mask: 16 },
        C: { ip: '192.168.0.1', mask: '24' },
        D: { ip: '224.0.0.1', mask: 24 },
        E: { ip: '240.0.0.0', mask: '255.255.0.0' }
      }
      const calcA = calc().setIp(cls.A.ip).setMask(cls.A.mask).calculate()
      const calcB = calc().setIp(cls.B.ip).setMask(cls.B.mask).calculate()
      const calcC = calc().setIp(cls.C.ip).setMask(cls.C.mask).calculate()
      const calcD = calc().setIp(cls.D.ip).setMask(cls.D.mask).calculate()
      const calcE = calc().setIp(cls.E.ip).setMask(cls.E.mask).calculate()
      expect(calcA.mask).toBe('8')
      expect(calcB.mask).toBe('16')
      expect(calcC.mask).toBe('24')
      expect(calcD.mask).toBe('24')
      expect(calcE.mask).toBe('16')
    })

    it('should return an error when calculate the network properties without a mask', () => {
      expect(() => calc().setIp('10.0.0.1').calculate()).toThrow(invalidIPorMask)
    })
  })

  describe('utils', () => {
    it('should convert an IP address to a binary dot notation string', () => {
      expect(calc().convertToBinary('192.168.1.1')).toEqual('11000000.10101000.00000001.00000001')
    })

    it('should convert an IP address to a hexadecimal string', () => {
      expect(calc().convertToHexa('192.168.1.1')).toEqual('c0a80101')
    })
  })
})
