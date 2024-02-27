import { Calculator, CalculatorOptions } from './calculator'

/**
 * Return a new Calculator instance.
 */
export default (options?: Partial<CalculatorOptions>) => new Calculator(options);

export { Calculator, CalculatorOptions }