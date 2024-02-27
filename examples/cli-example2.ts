import Calculator from '../src/index';

// Parse command line arguments to get the IP and the network mask
const args = process.argv.slice(2)
const [ip, mask] = args

if (!ip || !mask) {
  console.error('Usage: ts-node cli-implementation.ts <IP> <mask>')
  process.exit(1)
}

try {
  // Create a new Calculator instance with the provided IP and mask and perform the calculations
  console.log(Calculator()
    .setIp(ip)
    .setMask(mask)
    .calculate())

  process.exit(0)
} catch (error) {
  console.error(`Error: ${error}`)
  process.exit(1)
}