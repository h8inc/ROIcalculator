import togglePrices from './pricing.js';
import './utm.js';
import RoiCalculator from './RoiCalculator.html';
import RoiCalculatorBrands from './RoiCalculatorBrands.html';

const calculator = new RoiCalculator({
	target: document.getElementById('roi-calculator')
});

const calculatorBrands = new RoiCalculatorBrands({
	target: document.getElementById('roi-calculator-brands')
});

export {
	calculator,
	calculatorBrands,
	togglePrices
};