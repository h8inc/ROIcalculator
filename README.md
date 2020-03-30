# ROI Calculator

## Develop

    cd webflow-scripts

    yarn; yarn dev

Then open https://localhost:5000 in your browser so you can see the resulting page.

And then do your modifications to the files in `src`. Any changes should be refreshed in your browser automatically.

## Build and publish

    ./build.sh

That will update the bundle.css and bundle.js in the docs folder (which is published on github pages).

Then commit the bundle.css and bundle.js to git and push to master. That will publish them on github pages.

## Embedding on website

This is embedded as calculator on the swivle website using the following pieces of code.

ROI calculator:

    <div id='roi-calculator'></div>

ROI calculator for brands:

    <div id='roi-calculator-brands'></div>

Pricing toggle and values:

    <div>
        Annual Billing <input id="billing-type" type="checkbox" onclick="updatePrices()"> Monthly Billing
        <div>
            <span class="svlts-price">...</span>
        </div>
        <div>
            <span class="svltm-price">...</span>
        </div>
        <div>
            <span class="svltl-price">...</span>
        </div>
    </div>

## One-time setup

**We already set this up once on webflow, no need to do it again.**

The following piece of code needs to be added to the end of the page. It should only be added once.

    <link rel='stylesheet' href='https://woodwing.github.io/swivle-website/bundle.css' type='text/css' media='all' />
    <script type='text/javascript' src='https://woodwing.github.io/swivle-website/bundle.js'></script>
