import { Calculator, CalculatorOptions } from '../src/calculator';

// Parse command line arguments to get the IP and the network mask
const args = process.argv.slice(2)
const [ip, mask] = args

if (!ip || !mask) {
  console.error('Usage: ts-node cli-implementation.ts <IP> <mask>')
  process.exit(1)
}

try {
  // Create a new Calculator instance with the provided IP and mask
  const calculator = new Calculator({ ip, mask: mask })

  // Perform the calculations
  calculator.calculate()

  // Output the results
  console.log(`IP: ${calculator.ip}`)
  console.log(`Network: ${calculator.network}`)
  console.log(`Netmask: ${calculator.netmask}`)
  console.log(`Broadcast: ${calculator.broadcast}`)
  console.log(`Wildcard: ${calculator.wildcard}`)
  console.log(`HostMin: ${calculator.hostMin}`)
  console.log(`HostMax: ${calculator.hostMax}`)
  console.log(`IPv4 Class: ${calculator.ipv4Class}`)
  console.log(`Max Hosts: ${calculator.maxHosts}`)
  console.log(`Max Networks: ${calculator.maxNetworks}`)
  process.exit(0)
} catch (error) {
  console.error(`Error: ${error}`)
  process.exit(1)
}
