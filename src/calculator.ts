import { messages } from './config'
const { invalidIP, invalidMask, invalidIPorMask } = messages;

export type CalculatorOptions = {
  ip: string,
  mask: number | string,
}


export class Calculator {
  private ipOctets: number[] = []
  private maskBits: number = 0

  public ip: string = ''
  public network: string = ''
  public netmask: string = ''
  public broadcast: string = ''
  public wildcard: string = ''
  public hostMin: string = ''
  public hostMax: string = ''
  public ipv4Class: string = ''
  public maxHosts: string = ''
  public maxNetworks: string = ''
  public mask: string = ''

  /**
   * Constructor for creating a new Calculator instance.
   *
   * @param {CalculatorOptions} options - options for the calculator
   * @return {void} 
   */
  constructor(options?: Partial<CalculatorOptions>) {
    const ip: string = options?.ip ?? '127.0.0.1';
    const mask = options?.mask ?? 32;
    this.setIp(ip);
    this.setMask(mask);
  }

  /**
   * Validates the given IP address and returns an array of its octets.
   *
   * @param {string} ip - the IP address to validate
   * @param {string} message - the error message to throw if validation fails
   * @return {number[]} array of IP address octets
   */
  private validateIp(ip: string, message: string): number[] {
    const ipOctets = this.ipToOctetArray(ip);
    if (ipOctets.length !== 4) {
      throw new Error(message);
    }
    if (ipOctets.some((octet) => octet < 0 || octet > 255)) {
      throw new Error(message);
    }
    return ipOctets
  }

  /**
   * Validates the mask and throws an error if it's out of range.
   *
   * @param {number} mask - the mask to validate
   * @param {string} message - the error message to throw
   * @return {number} the validated mask
   */
  private validateMask(mask: number, message: string): number {
    if (mask < 0 || mask > 32) {
      throw new Error(message);
    }
    return mask
  }

  /**
   * Set the IP address for the calculator.
   *
   * @param {string} ip - the IP address to be set
   * @return {Calculator} the calculator instance with the IP address set
   */
  public setIp(ip: string): Calculator {
    this.ipOctets = this.validateIp(ip, invalidIP)
    // Builder pattern
    return this
  }

  /**
   * Set the subnet mask for the calculator.
   *
   * @param {number | string} mask - The subnet mask to be set
   * @return {Calculator} The updated Calculator object
   */
  public setMask(mask: number | string): Calculator {
    let maskNum
    if (typeof mask === 'number') { 
      maskNum = mask 
    }
    else if (/^\d+$/.test(mask)) { 
      maskNum = parseInt(mask, 10) 
    } 
    else {
      const octets = this.validateIp(mask, invalidMask);
      maskNum = this.getMaskBitsFromSubnetMask(octets);
    }
    this.maskBits = this.validateMask(maskNum, invalidMask);
    return this
  }

  /**
   * Calculates the network mask, network address, broadcast address, 
   * first and last IP addresses, ipv4 class, number of hosts and networks, 
   * and sets the calculated values to the corresponding properties.
   *
   * @return {Calculator} the Calculator object with the calculated values set
   */
  public calculate(): Calculator {
    const ip = this.ipOctets
    const mask = this.maskBits
    if (ip.length === 0 || mask === 0) { throw new Error(invalidIPorMask) }

    // Calculating the network mask
    const netmask = this.getNetworkMask(mask)
    const wildcard = this.getInvertedMask(netmask)

    // Calculating the network address
    const network = this.getNetwork(ip, netmask)

    // Calculating the broadcast address
    const broadcast = this.getBroadcast(network, wildcard)

    // Calculating the first and last IP addresses
    const hostMin = this.getHostMin(network)
    const hostMax = this.getHostMax(broadcast)

    // Set the ipv4 class
    const ipv4Class = this.getIpV4Class(ip)

    // Calculate the number of hosts and networks
    const numHosts = this.getHostNumber(netmask)
    const numNetworks = this.getNetworkNumber(netmask)

    // Show the calculated values
    this.ip = ip.join(".")
    this.network = network.join(".")
    this.ipv4Class = ipv4Class
    this.maxHosts = numHosts.toString()
    this.maxNetworks = numNetworks.toString()
    this.wildcard = wildcard.join(".")
    this.hostMin = hostMin.join(".")
    this.hostMax = hostMax.join(".")
    this.netmask = netmask.join(".")
    this.broadcast = broadcast.join(".")
    this.mask = mask.toString()

    // Builder pattern
    return this
  }

  /**
   * A function to calculate the network mask based on the prefix length.
   *
   * @param {number} prefixLength - the length of the prefix
   * @return {number[]} the network mask as an array of numbers
   */
  private getNetworkMask(prefixLength: number): number[] {
    const prefix = prefixLength >>> 0
    const networkMask = 0xffffffff << (32 - prefix)
    const netmask = [
      (networkMask >> 24) & 0xff,
      (networkMask >> 16) & 0xff,
      (networkMask >> 8) & 0xff,
      networkMask & 0xff,
    ]
    return netmask
  }

  /**
   * Retrieves the network address by performing a bitwise AND operation on the given IP address and netmask.
   *
   * @param {number[]} ip - The IP address array
   * @param {number[]} netmask - The netmask array
   * @return {number[]} The network address array
   */
  private getNetwork(ip: number[], netmask: number[]): number[] {
    return [
      ip[0] & netmask[0],
      ip[1] & netmask[1],
      ip[2] & netmask[2],
      ip[3] & netmask[3],
    ]
  }

  /**
   * Returns the inverted mask for the given netmask.
   *
   * @param {number[]} netmask - array of numbers representing the netmask
   * @return {number[]} array of numbers representing the inverted mask
   */
  private getInvertedMask(netmask: number[]): number[] {
    return [
      ~netmask[0] & 0xff,
      ~netmask[1] & 0xff,
      ~netmask[2] & 0xff,
      ~netmask[3] & 0xff,
    ]
  }

  /**
   * Returns the broadcast address by performing bitwise OR operation on each element of the network and invertedMask arrays.
   *
   * @param {number[]} network - The network array.
   * @param {number[]} invertedMask - The invertedMask array.
   * @return {number[]} The broadcast address array.
   */
  private getBroadcast(network: number[], invertedMask: number[]): number[] {
    return [
      network[0] | invertedMask[0],
      network[1] | invertedMask[1],
      network[2] | invertedMask[2],
      network[3] | invertedMask[3],
    ]
  }

  /**
   * Get the minimum host address in the given network.
   *
   * @param {number[]} network - array representing the network address
   * @return {number[]} the modified network address with the minimum host
   */
  private getHostMin(network: number[]): number[] {
    const naa: number[] = Object.assign([], network)
    naa[3] = naa[3] + 1
    return naa
  }

  /**
   * Returns the maximum host address for the given broadcast address.
   *
   * @param {number[]} broadcast - an array containing the broadcast address
   * @return {number[]} an array containing the maximum host address
   */
  private getHostMax(broadcast: number[]): number[] {
    const bcaConverted = this.convertToHexa(broadcast.join('.'))
    const bcaHostMax = this.subtractFromHex(bcaConverted)
    return this.hexaToIpArray(bcaHostMax)
  }

  /**
   * Get the IP class based on the first octet of the IP address.
   *
   * @param {number[]} ip - array containing the four octets of the IP address
   * @return {string} the IP class (A, B, C, D, or E)
   */
  private getIpV4Class(ip: number[]): string {
    const firstOctet = ip[0]
    if ((firstOctet & 0b10000000) === 0) return 'A'
    else if ((firstOctet & 0b01000000) === 0) return 'B'
    else if ((firstOctet & 0b00100000) === 0) return 'C'
    else if ((firstOctet & 0b00010000) === 0) return 'D'
    else return 'E'
  }

  /**
   * Retrieves the number of mask bits from the given subnet mask.
   *
   * @param {number[]} netmask - an array of numbers representing the subnet mask
   * @return {number} the total number of mask bits
   */
  private getMaskBitsFromSubnetMask(netmask: number[]): number {
    if (!this.maskBits) {
      this.maskBits = 0
      for (let octet of netmask) {
        let bitCount = 0
        while (octet & 0x80) {
          bitCount++
          octet <<= 1
        }
        this.maskBits += bitCount
      }
    }
    return this.maskBits
  }

  /**
   * Calculate the host number based on the netmask.
   *
   * @param {number[]} netmask - array representing the netmask
   * @return {number} the calculated host number
   */
  private getHostNumber(netmask: number[]): number {
    let maskBits = this.getMaskBitsFromSubnetMask(netmask)
    return 2 ** (32 - maskBits) - 2

  }

  /**
   * A function to calculate the network number based on the given netmask.
   *
   * @param {number[]} netmask - an array representing the netmask
   * @return {number} the calculated network number
   */
  private getNetworkNumber(netmask: number[]): number {
    let maskBits = this.getMaskBitsFromSubnetMask(netmask)
    return 2 ** maskBits
  }

  /**
   * Converts an IP address string to an array of its octets.
   *
   * @param {string} ip - the IP address string to convert
   * @return {number[]} an array of the IP address octets
   */
  private ipToOctetArray(ip: string): number[] {
    return ip.split(".").map(Number)
  }

  /**
   * Method to subtract 1 from a hexadecimal digit and return the result as a string.
   *
   * @param {string} hexDigit - The hexadecimal digit to subtract from.
   * @return {string} The resulting hexadecimal digit as a string.
   */
  private subtractFromHex(hexDigit: string): string {
    const numVal = parseInt(hexDigit, 16) - 1;
    return (numVal < 0 ? 'ff' : numVal.toString(16).padStart(2, '0'));
  }

  /**
   * Convert a hexadecimal string to an array of decimal numbers.
   *
   * @param {string} number - The hexadecimal string to be converted
   * @return {number[]} An array of decimal numbers
   */
  private hexaToIpArray(number: string): number[] {
    const hexaArray = number.match(/.{1,2}/g) || [];
    return hexaArray.map((hex) => parseInt(hex, 16));
  }


  /**
   * Converts the given IP address to binary representation.
   *
   * @param {string} ip - the IP address to be converted
   * @return {string} the binary representation of the IP address
   */
  public convertToBinary(ip: string): string {
    const ipParts: number[] = this.validateIp(ip, invalidIP)
    return ipParts.map((octet) => octet.toString(2).padStart(8, '0')).join('.')
  }

  /**
   * Convert the given IP address to hexadecimal.
   *
   * @param {string} ip - the IP address to convert
   * @return {string} the hexadecimal representation of the IP address
   */
  public convertToHexa(ip: string): string {
    const ipParts: number[] = this.validateIp(ip, invalidIP)
    return ipParts.map(part => part.toString(16).padStart(2, '0')).join('')
  }
}