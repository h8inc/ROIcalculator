
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function (exports) {
    'use strict';

    let products = null;
    let monthly = false;

    jQuery(document).ready(function () {
        let toggleBtn = jQuery(".svl-price-toggle");
        if (toggleBtn.length === 0) {
            return;
        }
        toggleBtn.click(togglePrices);
        jQuery.ajax({
            url: endpoint(),
            type: "GET",
            headers: {
                "Access-Control-Allow-Origin": "x-requested-with, x-requested-by"
            },
            dataType: "json",
            crossDomain: true
        }).done(function (data) {
            products = data.products;
            updatePrices();
        });
    });

    function endpoint() {
        return window.location.hostname === "localhost"
            ? "https://gibson-master-eu-west-1.swivle.io/services/public/price"
            : "https://gibson.swivle.com/services/public/price";
    }

    function togglePrices() {
        monthly = !monthly;
        updatePrices();
    }
    function updatePrices() {
        if (!products) return;
        if (monthly) {
            jQuery(".svlts-price").text(formatPriceMonth(products.SVLTSMX));
            jQuery(".svltm-price").text(formatPriceMonth(products.SVLTMMX));
            jQuery(".svltl-price").text(formatPriceMonth(products.SVLTLMX));
        } else {
            jQuery(".svlts-price").text(formatPriceYear(products.SVLTSYX));
            jQuery(".svltm-price").text(formatPriceYear(products.SVLTMYX));
            jQuery(".svltl-price").text(formatPriceYear(products.SVLTLYX));
        }
    }
    function formatPriceYear(product) {
        if (!product) return "..";
        var value = Math.round(parseFloat(product.value / 12));
        return formatPriceKeepingCurrencyInPlace(product, value);
    }

    function formatPriceMonth(product) {
        if (!product) return "..";
        var value = Math.round(parseFloat(product.value));
        return formatPriceKeepingCurrencyInPlace(product, value);
    }

    function formatPriceKeepingCurrencyInPlace(product, value) {
        return product.display.replace(/(.*?)\d.*\d(.*)/, "$1" + Math.round(value) + "$2");
    }

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_binding_callback(fn) {
        binding_callbacks.push(fn);
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.shift()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            while (render_callbacks.length) {
                const callback = render_callbacks.pop();
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_render);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_render.forEach(add_render_callback);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_render } = component.$$;
        fragment.m(target, anchor);
        // onMount happens after the initial afterUpdate. Because
        // afterUpdate callbacks happen in reverse order (inner first)
        // we schedule onMount callbacks before afterUpdate callbacks
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_render.forEach(add_render_callback);
    }
    function destroy(component, detaching) {
        if (component.$$) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_render: [],
            after_render: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_render);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro && component.$$.fragment.i)
                component.$$.fragment.i();
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy(this, true);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/RoiCalculator.html generated by Svelte v3.5.1 */

    const file = "src/RoiCalculator.html";

    // (125:4) {:else}
    function create_else_block(ctx) {
    	var div12, h1, t1, label0, t3, div0, t4_value = ctx.wastedHoursProject.toLocaleString('en', ctx.decimalOptions), t4, t5, label1, t7, div1, t8_value = ctx.opportunityCost.toLocaleString('en', ctx.currencyOptions), t8, t9, label2, t11, div2, t12_value = ctx.billableHoursYearly.toLocaleString('en', ctx.integerOptions), t12, t13, label3, t15, div3, t16_value = ctx.revenueIncreaseDam.toLocaleString('en', ctx.currencyOptions), t16, t17, label4, t19, div10, div6, div4, t20_value = ctx.revenueIncreaseTeam.toLocaleString('en', ctx.currencyOptions), t20, t21, div5, t22, t23, t24, t25, div9, div7, t26_value = ctx.revenueIncreaseOrg.toLocaleString('en', ctx.currencyOptions), t26, t27, div8, t28, t29, t30, t31, div11, p0, t33, p1, span, t35, a, t36, dispose;

    	return {
    		c: function create() {
    			div12 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Results with a DAM";
    			t1 = space();
    			label0 = element("label");
    			label0.textContent = "Billable hours per employee per project saved:";
    			t3 = space();
    			div0 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			label1 = element("label");
    			label1.textContent = "Team opportunity cost per project:";
    			t7 = space();
    			div1 = element("div");
    			t8 = text(t8_value);
    			t9 = space();
    			label2 = element("label");
    			label2.textContent = "Freed up billable hours yearly per employee:";
    			t11 = space();
    			div2 = element("div");
    			t12 = text(t12_value);
    			t13 = space();
    			label3 = element("label");
    			label3.textContent = "Potential GROSS savings with a DAM yearly";
    			t15 = space();
    			div3 = element("div");
    			t16 = text(t16_value);
    			t17 = space();
    			label4 = element("label");
    			label4.textContent = "Potential NET savings with Swivle yearly";
    			t19 = space();
    			div10 = element("div");
    			div6 = element("div");
    			div4 = element("div");
    			t20 = text(t20_value);
    			t21 = space();
    			div5 = element("div");
    			t22 = text("with Swivle Team at ");
    			t23 = text(currency);
    			t24 = text("539/mo");
    			t25 = space();
    			div9 = element("div");
    			div7 = element("div");
    			t26 = text(t26_value);
    			t27 = space();
    			div8 = element("div");
    			t28 = text("with Swivle Organization at ");
    			t29 = text(currency);
    			t30 = text("889/mo");
    			t31 = space();
    			div11 = element("div");
    			p0 = element("p");
    			p0.textContent = "To share these results with your colleagues:";
    			t33 = space();
    			p1 = element("p");
    			span = element("span");
    			span.textContent = "✅";
    			t35 = space();
    			a = element("a");
    			t36 = text("copy this link");
    			h1.className = "svelte-1qkr6hg";
    			add_location(h1, file, 126, 8, 6100);
    			label0.className = "svelte-1qkr6hg";
    			add_location(label0, file, 127, 8, 6136);
    			div0.className = "roi-result svelte-1qkr6hg";
    			add_location(div0, file, 128, 8, 6206);
    			label1.className = "svelte-1qkr6hg";
    			add_location(label1, file, 129, 8, 6302);
    			div1.className = "roi-result svelte-1qkr6hg";
    			add_location(div1, file, 130, 8, 6360);
    			label2.className = "svelte-1qkr6hg";
    			add_location(label2, file, 131, 8, 6454);
    			div2.className = "roi-result svelte-1qkr6hg";
    			add_location(div2, file, 132, 8, 6522);
    			label3.className = "svelte-1qkr6hg";
    			add_location(label3, file, 133, 8, 6619);
    			div3.className = "roi-result svelte-1qkr6hg";
    			add_location(div3, file, 134, 8, 6684);
    			label4.className = "svelte-1qkr6hg";
    			add_location(label4, file, 135, 8, 6781);
    			div4.className = "roi-result svelte-1qkr6hg";
    			add_location(div4, file, 138, 16, 6936);
    			div5.className = "roi-hint svelte-1qkr6hg";
    			add_location(div5, file, 139, 16, 7042);
    			div6.className = "double-result__block svelte-1qkr6hg";
    			add_location(div6, file, 137, 12, 6885);
    			div7.className = "roi-result svelte-1qkr6hg";
    			add_location(div7, file, 142, 16, 7189);
    			div8.className = "roi-hint svelte-1qkr6hg";
    			add_location(div8, file, 143, 16, 7294);
    			div9.className = "double-result__block svelte-1qkr6hg";
    			add_location(div9, file, 141, 12, 7138);
    			div10.className = "double-result svelte-1qkr6hg";
    			add_location(div10, file, 136, 8, 6845);
    			add_location(p0, file, 147, 12, 7447);
    			span.className = "roi-copy-feedback svelte-1qkr6hg";
    			toggle_class(span, "roi-copy-feedback-visible", ctx.linkCopyFeedback);
    			add_location(span, file, 148, 15, 7514);
    			a.className = "roi-link svelte-1qkr6hg";
    			a.href = ctx.shareableLink;
    			add_location(a, file, 148, 107, 7606);
    			add_location(p1, file, 148, 12, 7511);
    			div11.className = "roi-share svelte-1qkr6hg";
    			add_location(div11, file, 146, 10, 7411);
    			div12.className = "roi-block sticky svelte-1qkr6hg";
    			add_location(div12, file, 125, 4, 6061);
    			dispose = listen(a, "click", ctx.copyLink);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div12, anchor);
    			append(div12, h1);
    			append(div12, t1);
    			append(div12, label0);
    			append(div12, t3);
    			append(div12, div0);
    			append(div0, t4);
    			append(div12, t5);
    			append(div12, label1);
    			append(div12, t7);
    			append(div12, div1);
    			append(div1, t8);
    			append(div12, t9);
    			append(div12, label2);
    			append(div12, t11);
    			append(div12, div2);
    			append(div2, t12);
    			append(div12, t13);
    			append(div12, label3);
    			append(div12, t15);
    			append(div12, div3);
    			append(div3, t16);
    			append(div12, t17);
    			append(div12, label4);
    			append(div12, t19);
    			append(div12, div10);
    			append(div10, div6);
    			append(div6, div4);
    			append(div4, t20);
    			append(div6, t21);
    			append(div6, div5);
    			append(div5, t22);
    			append(div5, t23);
    			append(div5, t24);
    			append(div10, t25);
    			append(div10, div9);
    			append(div9, div7);
    			append(div7, t26);
    			append(div9, t27);
    			append(div9, div8);
    			append(div8, t28);
    			append(div8, t29);
    			append(div8, t30);
    			append(div12, t31);
    			append(div12, div11);
    			append(div11, p0);
    			append(div11, t33);
    			append(div11, p1);
    			append(p1, span);
    			append(p1, t35);
    			append(p1, a);
    			append(a, t36);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.wastedHoursProject) && t4_value !== (t4_value = ctx.wastedHoursProject.toLocaleString('en', ctx.decimalOptions))) {
    				set_data(t4, t4_value);
    			}

    			if ((changed.opportunityCost) && t8_value !== (t8_value = ctx.opportunityCost.toLocaleString('en', ctx.currencyOptions))) {
    				set_data(t8, t8_value);
    			}

    			if ((changed.billableHoursYearly) && t12_value !== (t12_value = ctx.billableHoursYearly.toLocaleString('en', ctx.integerOptions))) {
    				set_data(t12, t12_value);
    			}

    			if ((changed.revenueIncreaseDam) && t16_value !== (t16_value = ctx.revenueIncreaseDam.toLocaleString('en', ctx.currencyOptions))) {
    				set_data(t16, t16_value);
    			}

    			if ((changed.revenueIncreaseTeam) && t20_value !== (t20_value = ctx.revenueIncreaseTeam.toLocaleString('en', ctx.currencyOptions))) {
    				set_data(t20, t20_value);
    			}

    			if ((changed.revenueIncreaseOrg) && t26_value !== (t26_value = ctx.revenueIncreaseOrg.toLocaleString('en', ctx.currencyOptions))) {
    				set_data(t26, t26_value);
    			}

    			if (changed.linkCopyFeedback) {
    				toggle_class(span, "roi-copy-feedback-visible", ctx.linkCopyFeedback);
    			}

    			if (changed.shareableLink) {
    				a.href = ctx.shareableLink;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div12);
    			}

    			dispose();
    		}
    	};
    }

    // (117:4) {#if showExplanation}
    function create_if_block(ctx) {
    	var div1, h1, t1, div0, t3, button, dispose;

    	return {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "How does it work";
    			t1 = space();
    			div0 = element("div");
    			div0.textContent = "Fill in the fields about your team and processes. We've entered default values to help you get started.";
    			t3 = space();
    			button = element("button");
    			button.textContent = "Calculate";
    			h1.className = "svelte-1qkr6hg";
    			add_location(h1, file, 118, 8, 5815);
    			div0.className = "svelte-1qkr6hg";
    			add_location(div0, file, 119, 8, 5849);
    			button.className = "svelte-1qkr6hg";
    			add_location(button, file, 122, 8, 5990);
    			div1.className = "roi-block sticky roi-how svelte-1qkr6hg";
    			add_location(div1, file, 117, 4, 5768);
    			dispose = listen(button, "click", ctx.start);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, h1);
    			append(div1, t1);
    			append(div1, div0);
    			append(div1, t3);
    			append(div1, button);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			dispose();
    		}
    	};
    }

    function create_fragment(ctx) {
    	var div6, div5, h1, t1, div2, h20, t3, label0, t5, input0, input0_placeholder_value, t6, label1, t8, div1, input1, input1_placeholder_value, t9, div0, t10, t11, div3, h21, t13, label2, t15, input2, input2_placeholder_value, t16, label3, t18, input3, input3_placeholder_value, t19, div4, h22, t21, label4, t23, input4, input4_placeholder_value, t24, label5, t26, input5, input5_placeholder_value, t27, label6, t29, input6, input6_placeholder_value, t30, label7, t32, input7, input7_placeholder_value, t33, label8, t35, input8, input8_placeholder_value, t36, dispose;

    	function select_block_type(ctx) {
    		if (ctx.showExplanation) return create_if_block;
    		return create_else_block;
    	}

    	var current_block_type = select_block_type(ctx);
    	var if_block = current_block_type(ctx);

    	return {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Estimate Savings";
    			t1 = space();
    			div2 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Your team";
    			t3 = space();
    			label0 = element("label");
    			label0.textContent = "Team members per client project";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			label1 = element("label");
    			label1.textContent = "Billable hourly rate per team member";
    			t8 = space();
    			div1 = element("div");
    			input1 = element("input");
    			t9 = space();
    			div0 = element("div");
    			t10 = text(currency);
    			t11 = space();
    			div3 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Your projects";
    			t13 = space();
    			label2 = element("label");
    			label2.textContent = "Client projects per year";
    			t15 = space();
    			input2 = element("input");
    			t16 = space();
    			label3 = element("label");
    			label3.textContent = "Feedback rounds per project before last client approval";
    			t18 = space();
    			input3 = element("input");
    			t19 = space();
    			div4 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Time per project spent on activities (in minutes)";
    			t21 = space();
    			label4 = element("label");
    			label4.textContent = "Collecting, archiving and searching for client files";
    			t23 = space();
    			input4 = element("input");
    			t24 = space();
    			label5 = element("label");
    			label5.textContent = "Internal collaboration before first draft";
    			t26 = space();
    			input5 = element("input");
    			t27 = space();
    			label6 = element("label");
    			label6.textContent = "Sending files for each feedback round";
    			t29 = space();
    			input6 = element("input");
    			t30 = space();
    			label7 = element("label");
    			label7.textContent = "Communication time with client per feedback round";
    			t32 = space();
    			input7 = element("input");
    			t33 = space();
    			label8 = element("label");
    			label8.textContent = "Communicate back to creative team";
    			t35 = space();
    			input8 = element("input");
    			t36 = space();
    			if_block.c();
    			h1.className = "svelte-1qkr6hg";
    			add_location(h1, file, 83, 8, 3693);
    			h20.className = "svelte-1qkr6hg";
    			add_location(h20, file, 85, 12, 3763);
    			label0.className = "svelte-1qkr6hg";
    			add_location(label0, file, 86, 12, 3794);
    			input0.placeholder = input0_placeholder_value = ctx.initial.team;
    			attr(input0, "type", "number");
    			input0.min = "0";
    			input0.className = "svelte-1qkr6hg";
    			add_location(input0, file, 87, 12, 3853);
    			label1.className = "svelte-1qkr6hg";
    			add_location(label1, file, 88, 12, 3967);
    			input1.placeholder = input1_placeholder_value = ctx.initial.billable;
    			attr(input1, "type", "number");
    			input1.min = "0";
    			input1.className = "svelte-1qkr6hg";
    			add_location(input1, file, 90, 16, 4074);
    			div0.className = "roi-sign svelte-1qkr6hg";
    			add_location(div0, file, 91, 16, 4177);
    			div1.className = "roi-currency svelte-1qkr6hg";
    			add_location(div1, file, 89, 12, 4031);
    			div2.className = "roi-group svelte-1qkr6hg";
    			add_location(div2, file, 84, 8, 3727);
    			h21.className = "svelte-1qkr6hg";
    			add_location(h21, file, 95, 12, 4294);
    			label2.className = "svelte-1qkr6hg";
    			add_location(label2, file, 96, 12, 4329);
    			input2.placeholder = input2_placeholder_value = ctx.initial.projects;
    			attr(input2, "type", "number");
    			input2.min = "0";
    			input2.className = "svelte-1qkr6hg";
    			add_location(input2, file, 97, 12, 4382);
    			label3.className = "svelte-1qkr6hg";
    			add_location(label3, file, 98, 12, 4481);
    			input3.placeholder = input3_placeholder_value = ctx.initial.feedbackLoops;
    			attr(input3, "type", "number");
    			input3.min = "0";
    			input3.className = "svelte-1qkr6hg";
    			add_location(input3, file, 99, 12, 4564);
    			div3.className = "roi-group svelte-1qkr6hg";
    			add_location(div3, file, 94, 8, 4258);
    			h22.className = "svelte-1qkr6hg";
    			add_location(h22, file, 102, 12, 4720);
    			label4.className = "svelte-1qkr6hg";
    			add_location(label4, file, 103, 12, 4791);
    			input4.placeholder = input4_placeholder_value = ctx.initial.assembling;
    			attr(input4, "type", "number");
    			input4.min = "0";
    			input4.className = "svelte-1qkr6hg";
    			add_location(input4, file, 104, 12, 4871);
    			label5.className = "svelte-1qkr6hg";
    			add_location(label5, file, 105, 12, 4974);
    			input5.placeholder = input5_placeholder_value = ctx.initial.collaborating;
    			attr(input5, "type", "number");
    			input5.min = "0";
    			input5.className = "svelte-1qkr6hg";
    			add_location(input5, file, 106, 12, 5043);
    			label6.className = "svelte-1qkr6hg";
    			add_location(label6, file, 107, 12, 5152);
    			input6.placeholder = input6_placeholder_value = ctx.initial.sendFeedback;
    			attr(input6, "type", "number");
    			input6.min = "0";
    			input6.className = "svelte-1qkr6hg";
    			add_location(input6, file, 108, 12, 5217);
    			label7.className = "svelte-1qkr6hg";
    			add_location(label7, file, 109, 12, 5324);
    			input7.placeholder = input7_placeholder_value = ctx.initial.communicationClient;
    			attr(input7, "type", "number");
    			input7.min = "0";
    			input7.className = "svelte-1qkr6hg";
    			add_location(input7, file, 110, 12, 5401);
    			label8.className = "svelte-1qkr6hg";
    			add_location(label8, file, 111, 12, 5522);
    			input8.placeholder = input8_placeholder_value = ctx.initial.communicationInternal;
    			attr(input8, "type", "number");
    			input8.min = "0";
    			input8.className = "svelte-1qkr6hg";
    			add_location(input8, file, 112, 12, 5583);
    			div4.className = "roi-group svelte-1qkr6hg";
    			add_location(div4, file, 101, 8, 4684);
    			div5.className = "roi-block svelte-1qkr6hg";
    			add_location(div5, file, 82, 4, 3620);
    			div6.className = "roi-wrapper svelte-1qkr6hg";
    			add_location(div6, file, 81, 0, 3590);

    			dispose = [
    				listen(input0, "input", ctx.input0_input_handler),
    				listen(input1, "input", ctx.input1_input_handler),
    				listen(input2, "input", ctx.input2_input_handler),
    				listen(input3, "input", ctx.input3_input_handler),
    				listen(input4, "input", ctx.input4_input_handler),
    				listen(input5, "input", ctx.input5_input_handler),
    				listen(input6, "input", ctx.input6_input_handler),
    				listen(input7, "input", ctx.input7_input_handler),
    				listen(input8, "input", ctx.input8_input_handler),
    				listen(div5, "change", ctx.change_handler)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div6, anchor);
    			append(div6, div5);
    			append(div5, h1);
    			append(div5, t1);
    			append(div5, div2);
    			append(div2, h20);
    			append(div2, t3);
    			append(div2, label0);
    			append(div2, t5);
    			append(div2, input0);

    			input0.value = ctx.team;

    			add_binding_callback(() => ctx.input0_binding(input0, null));
    			append(div2, t6);
    			append(div2, label1);
    			append(div2, t8);
    			append(div2, div1);
    			append(div1, input1);

    			input1.value = ctx.billable;

    			append(div1, t9);
    			append(div1, div0);
    			append(div0, t10);
    			append(div5, t11);
    			append(div5, div3);
    			append(div3, h21);
    			append(div3, t13);
    			append(div3, label2);
    			append(div3, t15);
    			append(div3, input2);

    			input2.value = ctx.projects;

    			append(div3, t16);
    			append(div3, label3);
    			append(div3, t18);
    			append(div3, input3);

    			input3.value = ctx.feedbackLoops;

    			append(div5, t19);
    			append(div5, div4);
    			append(div4, h22);
    			append(div4, t21);
    			append(div4, label4);
    			append(div4, t23);
    			append(div4, input4);

    			input4.value = ctx.assembling;

    			append(div4, t24);
    			append(div4, label5);
    			append(div4, t26);
    			append(div4, input5);

    			input5.value = ctx.collaborating;

    			append(div4, t27);
    			append(div4, label6);
    			append(div4, t29);
    			append(div4, input6);

    			input6.value = ctx.sendFeedback;

    			append(div4, t30);
    			append(div4, label7);
    			append(div4, t32);
    			append(div4, input7);

    			input7.value = ctx.communicationClient;

    			append(div4, t33);
    			append(div4, label8);
    			append(div4, t35);
    			append(div4, input8);

    			input8.value = ctx.communicationInternal;

    			append(div6, t36);
    			if_block.m(div6, null);
    		},

    		p: function update(changed, ctx) {
    			if (changed.team) input0.value = ctx.team;
    			if (changed.items) {
    				ctx.input0_binding(null, input0);
    				ctx.input0_binding(input0, null);
    			}
    			if (changed.billable) input1.value = ctx.billable;
    			if (changed.projects) input2.value = ctx.projects;
    			if (changed.feedbackLoops) input3.value = ctx.feedbackLoops;
    			if (changed.assembling) input4.value = ctx.assembling;
    			if (changed.collaborating) input5.value = ctx.collaborating;
    			if (changed.sendFeedback) input6.value = ctx.sendFeedback;
    			if (changed.communicationClient) input7.value = ctx.communicationClient;
    			if (changed.communicationInternal) input8.value = ctx.communicationInternal;

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(div6, null);
    				}
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div6);
    			}

    			ctx.input0_binding(null, input0);
    			if_block.d();
    			run_all(dispose);
    		}
    	};
    }

    let currency = "$";

    function stripQueryString(href) {
        return href.split("?")[0];
    }

    function instance($$self, $$props, $$invalidate) {
    	const qsInput = (new URLSearchParams(window.location.search).get("roi_agency") || "").split("-");
        const initial = {
            team: parseInt(qsInput[0]) || 3,
            billable: parseInt(qsInput[1]) || 80,
            projects: parseInt(qsInput[2]) || 40,
            assembling: parseInt(qsInput[3]) || 30,
            collaborating: parseInt(qsInput[4]) || 120,
            sendFeedback: parseInt(qsInput[5]) || 15,
            feedbackLoops: parseInt(qsInput[6]) || 3,
            communicationClient: parseInt(qsInput[7]) || 30,
            communicationInternal: parseInt(qsInput[8]) || 15
        };

        const decimalOptions = { style: "decimal", maximumFractionDigits: 1 };
        const integerOptions = { style: "decimal", maximumFractionDigits: 0 };
        const currencyOptions = { style: "currency", currency: "USD", maximumFractionDigits: 0, minimumFractionDigits: 0 };
        let showExplanation = qsInput.length < 2;
        let firstInput;
        let shareableLink;
        let linkCopyFeedback = false;

        let team = initial.team;
        let billable = initial.billable;
        let projects = initial.projects;
        let assembling = initial.assembling;
        let collaborating = initial.collaborating;
        let sendFeedback = initial.sendFeedback;
        let feedbackLoops = initial.feedbackLoops;
        let communicationClient = initial.communicationClient;
        let communicationInternal = initial.communicationInternal;
        function start() {
            $$invalidate('showExplanation', showExplanation = false);
            firstInput.focus();
            firstInput.select();
        }

        function copyLink(event) {
            event.preventDefault();
            navigator.clipboard.writeText(`${shareableLink}`);
            $$invalidate('linkCopyFeedback', linkCopyFeedback = true);
            setTimeout(() => { const $$result = linkCopyFeedback = false; $$invalidate('linkCopyFeedback', linkCopyFeedback); return $$result; }, 1500);
            return false;
        }

    	function input0_input_handler() {
    		team = to_number(this.value);
    		$$invalidate('team', team);
    	}

    	function input0_binding($$node, check) {
    		firstInput = $$node;
    		$$invalidate('firstInput', firstInput);
    	}

    	function input1_input_handler() {
    		billable = to_number(this.value);
    		$$invalidate('billable', billable);
    	}

    	function input2_input_handler() {
    		projects = to_number(this.value);
    		$$invalidate('projects', projects);
    	}

    	function input3_input_handler() {
    		feedbackLoops = to_number(this.value);
    		$$invalidate('feedbackLoops', feedbackLoops);
    	}

    	function input4_input_handler() {
    		assembling = to_number(this.value);
    		$$invalidate('assembling', assembling);
    	}

    	function input5_input_handler() {
    		collaborating = to_number(this.value);
    		$$invalidate('collaborating', collaborating);
    	}

    	function input6_input_handler() {
    		sendFeedback = to_number(this.value);
    		$$invalidate('sendFeedback', sendFeedback);
    	}

    	function input7_input_handler() {
    		communicationClient = to_number(this.value);
    		$$invalidate('communicationClient', communicationClient);
    	}

    	function input8_input_handler() {
    		communicationInternal = to_number(this.value);
    		$$invalidate('communicationInternal', communicationInternal);
    	}

    	function change_handler() {
    		const $$result = showExplanation = false;
    		$$invalidate('showExplanation', showExplanation);
    		return $$result;
    	}

    	let collaboratingProject, timeSendingApprovalsProject, feedbackCommunication, wastedHoursProject, opportunityCost, billableHoursYearly, revenueIncreaseDam, revenueIncreaseTeam, revenueIncreaseOrg;

    	$$self.$$.update = ($$dirty = { assembling: 1, collaborating: 1, sendFeedback: 1, feedbackLoops: 1, communicationClient: 1, communicationInternal: 1, collaboratingProject: 1, timeSendingApprovalsProject: 1, feedbackCommunication: 1, wastedHoursProject: 1, billable: 1, team: 1, projects: 1, billableHoursYearly: 1 }) => {
    		if ($$dirty.assembling || $$dirty.collaborating) { $$invalidate('collaboratingProject', collaboratingProject = (assembling || initial.assembling) / 60 + (collaborating || initial.collaborating) / 60); }
    		if ($$dirty.sendFeedback || $$dirty.feedbackLoops) { $$invalidate('timeSendingApprovalsProject', timeSendingApprovalsProject = ((sendFeedback || initial.sendFeedback) * (feedbackLoops || initial.feedbackLoops)) / 60); }
    		if ($$dirty.feedbackLoops || $$dirty.communicationClient || $$dirty.communicationInternal) { $$invalidate('feedbackCommunication', feedbackCommunication = ((feedbackLoops || initial.feedbackLoops) * (communicationClient || initial.communicationClient) + (feedbackLoops || initial.feedbackLoops) * (communicationInternal || initial.communicationInternal)) / 60); }
    		if ($$dirty.collaboratingProject || $$dirty.timeSendingApprovalsProject || $$dirty.feedbackCommunication) { $$invalidate('wastedHoursProject', wastedHoursProject = collaboratingProject + timeSendingApprovalsProject + feedbackCommunication); }
    		if ($$dirty.wastedHoursProject || $$dirty.billable || $$dirty.team) { $$invalidate('opportunityCost', opportunityCost = wastedHoursProject * (billable || initial.billable) * (team || initial.team)); }
    		if ($$dirty.wastedHoursProject || $$dirty.projects) { $$invalidate('billableHoursYearly', billableHoursYearly = wastedHoursProject * (projects || initial.projects)); }
    		if ($$dirty.billableHoursYearly || $$dirty.billable || $$dirty.team) { $$invalidate('revenueIncreaseDam', revenueIncreaseDam = billableHoursYearly * (billable || initial.billable) * (team || initial.team)); }
    		if ($$dirty.billableHoursYearly || $$dirty.billable || $$dirty.team) { $$invalidate('revenueIncreaseTeam', revenueIncreaseTeam = billableHoursYearly * (billable || initial.billable) * (team || initial.team) - (539 * 12)); }
    		if ($$dirty.billableHoursYearly || $$dirty.billable || $$dirty.team) { $$invalidate('revenueIncreaseOrg', revenueIncreaseOrg = billableHoursYearly * (billable || initial.billable) * (team || initial.team) - (889 * 12)); }
    		if ($$dirty.team || $$dirty.billable || $$dirty.projects || $$dirty.assembling || $$dirty.collaborating || $$dirty.sendFeedback || $$dirty.feedbackLoops || $$dirty.communicationClient || $$dirty.communicationInternal) { {
                    const data = [
                        Math.abs(team),
                        Math.abs(billable),
                        Math.abs(projects),
                        Math.abs(assembling),
                        Math.abs(collaborating),
                        Math.abs(sendFeedback),
                        Math.abs(feedbackLoops),
                        Math.abs(communicationClient),
                        Math.abs(communicationInternal)
                    ];
                    const qs = new URLSearchParams(window.location.search);
                    qs.set("roi_agency", data.join("-"));
                    $$invalidate('shareableLink', shareableLink = `${stripQueryString(window.location.href)}?${qs.toString()}`);
                } }
    	};

    	return {
    		initial,
    		decimalOptions,
    		integerOptions,
    		currencyOptions,
    		showExplanation,
    		firstInput,
    		shareableLink,
    		linkCopyFeedback,
    		team,
    		billable,
    		projects,
    		assembling,
    		collaborating,
    		sendFeedback,
    		feedbackLoops,
    		communicationClient,
    		communicationInternal,
    		start,
    		copyLink,
    		wastedHoursProject,
    		opportunityCost,
    		billableHoursYearly,
    		revenueIncreaseDam,
    		revenueIncreaseTeam,
    		revenueIncreaseOrg,
    		input0_input_handler,
    		input0_binding,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler,
    		input7_input_handler,
    		input8_input_handler,
    		change_handler
    	};
    }

    class RoiCalculator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    	}
    }

    /* src/RoiCalculatorBrands.html generated by Svelte v3.5.1 */

    const file$1 = "src/RoiCalculatorBrands.html";

    // (108:4) {:else}
    function create_else_block$1(ctx) {
    	var div12, h1, t1, label0, t3, div0, t4_value = ctx.wastedHoursProject.toLocaleString('en', ctx.decimalOptions), t4, t5, label1, t7, div1, t8_value = ctx.opportunityCost.toLocaleString('en', ctx.currencyOptions), t8, t9, label2, t11, div2, t12_value = ctx.billableHoursYearly.toLocaleString('en', ctx.integerOptions), t12, t13, label3, t15, div3, t16_value = ctx.revenueIncreaseDam.toLocaleString('en', ctx.currencyOptions), t16, t17, label4, t19, div10, div6, div4, t20_value = ctx.revenueIncreaseTeam.toLocaleString('en', ctx.currencyOptions), t20, t21, div5, t22, t23, t24, t25, div9, div7, t26_value = ctx.revenueIncreaseOrg.toLocaleString('en', ctx.currencyOptions), t26, t27, div8, t28, t29, t30, t31, div11, p0, t33, p1, span, t35, a, t36, dispose;

    	return {
    		c: function create() {
    			div12 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Results with a DAM";
    			t1 = space();
    			label0 = element("label");
    			label0.textContent = "Hours per week saved per employee:";
    			t3 = space();
    			div0 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			label1 = element("label");
    			label1.textContent = "Team opportunity cost per week:";
    			t7 = space();
    			div1 = element("div");
    			t8 = text(t8_value);
    			t9 = space();
    			label2 = element("label");
    			label2.textContent = "Hours saved yearly per employee:";
    			t11 = space();
    			div2 = element("div");
    			t12 = text(t12_value);
    			t13 = space();
    			label3 = element("label");
    			label3.textContent = "Potential GROSS savings with a DAM yearly";
    			t15 = space();
    			div3 = element("div");
    			t16 = text(t16_value);
    			t17 = space();
    			label4 = element("label");
    			label4.textContent = "Potential NET savings with Swivle yearly";
    			t19 = space();
    			div10 = element("div");
    			div6 = element("div");
    			div4 = element("div");
    			t20 = text(t20_value);
    			t21 = space();
    			div5 = element("div");
    			t22 = text("with Swivle Team M at ");
    			t23 = text(currency$1);
    			t24 = text("539/mo");
    			t25 = space();
    			div9 = element("div");
    			div7 = element("div");
    			t26 = text(t26_value);
    			t27 = space();
    			div8 = element("div");
    			t28 = text("with Swivle Team L at ");
    			t29 = text(currency$1);
    			t30 = text("889/mo");
    			t31 = space();
    			div11 = element("div");
    			p0 = element("p");
    			p0.textContent = "To share these results with your colleagues:";
    			t33 = space();
    			p1 = element("p");
    			span = element("span");
    			span.textContent = "✅";
    			t35 = space();
    			a = element("a");
    			t36 = text("copy this link");
    			h1.className = "svelte-1qkr6hg";
    			add_location(h1, file$1, 109, 8, 5004);
    			label0.className = "svelte-1qkr6hg";
    			add_location(label0, file$1, 110, 8, 5040);
    			div0.className = "roi-result svelte-1qkr6hg";
    			add_location(div0, file$1, 111, 8, 5098);
    			label1.className = "svelte-1qkr6hg";
    			add_location(label1, file$1, 112, 8, 5194);
    			div1.className = "roi-result svelte-1qkr6hg";
    			add_location(div1, file$1, 113, 8, 5249);
    			label2.className = "svelte-1qkr6hg";
    			add_location(label2, file$1, 114, 8, 5343);
    			div2.className = "roi-result svelte-1qkr6hg";
    			add_location(div2, file$1, 115, 8, 5399);
    			label3.className = "svelte-1qkr6hg";
    			add_location(label3, file$1, 116, 8, 5496);
    			div3.className = "roi-result svelte-1qkr6hg";
    			add_location(div3, file$1, 117, 8, 5561);
    			label4.className = "svelte-1qkr6hg";
    			add_location(label4, file$1, 118, 8, 5660);
    			div4.className = "roi-result svelte-1qkr6hg";
    			add_location(div4, file$1, 121, 16, 5815);
    			div5.className = "roi-hint svelte-1qkr6hg";
    			add_location(div5, file$1, 122, 16, 5921);
    			div6.className = "double-result__block svelte-1qkr6hg";
    			add_location(div6, file$1, 120, 12, 5764);
    			div7.className = "roi-result svelte-1qkr6hg";
    			add_location(div7, file$1, 125, 16, 6070);
    			div8.className = "roi-hint svelte-1qkr6hg";
    			add_location(div8, file$1, 126, 16, 6175);
    			div9.className = "double-result__block svelte-1qkr6hg";
    			add_location(div9, file$1, 124, 12, 6019);
    			div10.className = "double-result svelte-1qkr6hg";
    			add_location(div10, file$1, 119, 8, 5724);
    			add_location(p0, file$1, 130, 16, 6328);
    			span.className = "roi-copy-feedback svelte-1qkr6hg";
    			toggle_class(span, "roi-copy-feedback-visible", ctx.linkCopyFeedback);
    			add_location(span, file$1, 131, 19, 6399);
    			a.className = "roi-link svelte-1qkr6hg";
    			a.href = ctx.shareableLink;
    			add_location(a, file$1, 131, 111, 6491);
    			add_location(p1, file$1, 131, 16, 6396);
    			div11.className = "roi-share svelte-1qkr6hg";
    			add_location(div11, file$1, 129, 12, 6288);
    			div12.className = "roi-block sticky svelte-1qkr6hg";
    			add_location(div12, file$1, 108, 4, 4965);
    			dispose = listen(a, "click", ctx.copyLink);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div12, anchor);
    			append(div12, h1);
    			append(div12, t1);
    			append(div12, label0);
    			append(div12, t3);
    			append(div12, div0);
    			append(div0, t4);
    			append(div12, t5);
    			append(div12, label1);
    			append(div12, t7);
    			append(div12, div1);
    			append(div1, t8);
    			append(div12, t9);
    			append(div12, label2);
    			append(div12, t11);
    			append(div12, div2);
    			append(div2, t12);
    			append(div12, t13);
    			append(div12, label3);
    			append(div12, t15);
    			append(div12, div3);
    			append(div3, t16);
    			append(div12, t17);
    			append(div12, label4);
    			append(div12, t19);
    			append(div12, div10);
    			append(div10, div6);
    			append(div6, div4);
    			append(div4, t20);
    			append(div6, t21);
    			append(div6, div5);
    			append(div5, t22);
    			append(div5, t23);
    			append(div5, t24);
    			append(div10, t25);
    			append(div10, div9);
    			append(div9, div7);
    			append(div7, t26);
    			append(div9, t27);
    			append(div9, div8);
    			append(div8, t28);
    			append(div8, t29);
    			append(div8, t30);
    			append(div12, t31);
    			append(div12, div11);
    			append(div11, p0);
    			append(div11, t33);
    			append(div11, p1);
    			append(p1, span);
    			append(p1, t35);
    			append(p1, a);
    			append(a, t36);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.wastedHoursProject) && t4_value !== (t4_value = ctx.wastedHoursProject.toLocaleString('en', ctx.decimalOptions))) {
    				set_data(t4, t4_value);
    			}

    			if ((changed.opportunityCost) && t8_value !== (t8_value = ctx.opportunityCost.toLocaleString('en', ctx.currencyOptions))) {
    				set_data(t8, t8_value);
    			}

    			if ((changed.billableHoursYearly) && t12_value !== (t12_value = ctx.billableHoursYearly.toLocaleString('en', ctx.integerOptions))) {
    				set_data(t12, t12_value);
    			}

    			if ((changed.revenueIncreaseDam) && t16_value !== (t16_value = ctx.revenueIncreaseDam.toLocaleString('en', ctx.currencyOptions))) {
    				set_data(t16, t16_value);
    			}

    			if ((changed.revenueIncreaseTeam) && t20_value !== (t20_value = ctx.revenueIncreaseTeam.toLocaleString('en', ctx.currencyOptions))) {
    				set_data(t20, t20_value);
    			}

    			if ((changed.revenueIncreaseOrg) && t26_value !== (t26_value = ctx.revenueIncreaseOrg.toLocaleString('en', ctx.currencyOptions))) {
    				set_data(t26, t26_value);
    			}

    			if (changed.linkCopyFeedback) {
    				toggle_class(span, "roi-copy-feedback-visible", ctx.linkCopyFeedback);
    			}

    			if (changed.shareableLink) {
    				a.href = ctx.shareableLink;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div12);
    			}

    			dispose();
    		}
    	};
    }

    // (100:4) {#if showExplanation}
    function create_if_block$1(ctx) {
    	var div1, h1, t1, div0, t3, button, dispose;

    	return {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "How does it work";
    			t1 = space();
    			div0 = element("div");
    			div0.textContent = "Fill in the fields about your team and processes. We've entered default values to help you get started.";
    			t3 = space();
    			button = element("button");
    			button.textContent = "Calculate";
    			h1.className = "svelte-1qkr6hg";
    			add_location(h1, file$1, 101, 8, 4719);
    			div0.className = "svelte-1qkr6hg";
    			add_location(div0, file$1, 102, 8, 4753);
    			button.className = "svelte-1qkr6hg";
    			add_location(button, file$1, 105, 8, 4894);
    			div1.className = "roi-block sticky roi-how svelte-1qkr6hg";
    			add_location(div1, file$1, 100, 4, 4672);
    			dispose = listen(button, "click", ctx.start);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, h1);
    			append(div1, t1);
    			append(div1, div0);
    			append(div1, t3);
    			append(div1, button);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			dispose();
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var div5, div4, h1, t1, div2, h20, t3, label0, t5, input0, input0_placeholder_value, t6, label1, t8, div1, input1, input1_placeholder_value, t9, div0, t10, t11, div3, h21, t13, label2, t15, input2, input2_placeholder_value, t16, label3, t18, input3, input3_placeholder_value, t19, label4, t21, input4, input4_placeholder_value, t22, label5, t24, input5, input5_placeholder_value, t25, dispose;

    	function select_block_type(ctx) {
    		if (ctx.showExplanation) return create_if_block$1;
    		return create_else_block$1;
    	}

    	var current_block_type = select_block_type(ctx);
    	var if_block = current_block_type(ctx);

    	return {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Estimate Savings";
    			t1 = space();
    			div2 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Your team";
    			t3 = space();
    			label0 = element("label");
    			label0.textContent = "Team members managing files (marketing, design, PM, etc.)";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			label1 = element("label");
    			label1.textContent = "Avg. annual cost of a team member";
    			t8 = space();
    			div1 = element("div");
    			input1 = element("input");
    			t9 = space();
    			div0 = element("div");
    			t10 = text(currency$1);
    			t11 = space();
    			div3 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Weekly time spent on file management for each employee (hours)";
    			t13 = space();
    			label2 = element("label");
    			label2.textContent = "Accessing, searching and archiving";
    			t15 = space();
    			input2 = element("input");
    			t16 = space();
    			label3 = element("label");
    			label3.textContent = "Internal collaboration (edits, versioning, etc.)";
    			t18 = space();
    			input3 = element("input");
    			t19 = space();
    			label4 = element("label");
    			label4.textContent = "Sending files to colleagues";
    			t21 = space();
    			input4 = element("input");
    			t22 = space();
    			label5 = element("label");
    			label5.textContent = "Time in communication each time";
    			t24 = space();
    			input5 = element("input");
    			t25 = space();
    			if_block.c();
    			h1.className = "svelte-1qkr6hg";
    			add_location(h1, file$1, 76, 8, 3228);
    			h20.className = "svelte-1qkr6hg";
    			add_location(h20, file$1, 78, 12, 3298);
    			label0.className = "svelte-1qkr6hg";
    			add_location(label0, file$1, 79, 12, 3329);
    			input0.placeholder = input0_placeholder_value = ctx.initial.team;
    			attr(input0, "type", "number");
    			input0.min = "0";
    			input0.className = "svelte-1qkr6hg";
    			add_location(input0, file$1, 80, 12, 3414);
    			label1.className = "svelte-1qkr6hg";
    			add_location(label1, file$1, 81, 12, 3528);
    			input1.placeholder = input1_placeholder_value = ctx.initial.billable;
    			attr(input1, "type", "number");
    			input1.min = "0";
    			input1.className = "svelte-1qkr6hg";
    			add_location(input1, file$1, 83, 16, 3632);
    			div0.className = "roi-sign svelte-1qkr6hg";
    			add_location(div0, file$1, 84, 16, 3735);
    			div1.className = "roi-currency svelte-1qkr6hg";
    			add_location(div1, file$1, 82, 12, 3589);
    			div2.className = "roi-group svelte-1qkr6hg";
    			add_location(div2, file$1, 77, 8, 3262);
    			h21.className = "svelte-1qkr6hg";
    			add_location(h21, file$1, 88, 12, 3852);
    			label2.className = "svelte-1qkr6hg";
    			add_location(label2, file$1, 89, 12, 3936);
    			input2.placeholder = input2_placeholder_value = ctx.initial.assembling;
    			attr(input2, "type", "number");
    			input2.min = "0";
    			input2.className = "svelte-1qkr6hg";
    			add_location(input2, file$1, 90, 12, 3998);
    			label3.className = "svelte-1qkr6hg";
    			add_location(label3, file$1, 91, 12, 4101);
    			input3.placeholder = input3_placeholder_value = ctx.initial.collaborating;
    			attr(input3, "type", "number");
    			input3.min = "0";
    			input3.className = "svelte-1qkr6hg";
    			add_location(input3, file$1, 92, 12, 4177);
    			label4.className = "svelte-1qkr6hg";
    			add_location(label4, file$1, 93, 12, 4286);
    			input4.placeholder = input4_placeholder_value = ctx.initial.sendFeedback;
    			attr(input4, "type", "number");
    			input4.min = "0";
    			input4.className = "svelte-1qkr6hg";
    			add_location(input4, file$1, 94, 12, 4341);
    			label5.className = "svelte-1qkr6hg";
    			add_location(label5, file$1, 95, 12, 4448);
    			input5.placeholder = input5_placeholder_value = ctx.initial.communicationClient;
    			attr(input5, "type", "number");
    			input5.min = "0";
    			input5.className = "svelte-1qkr6hg";
    			add_location(input5, file$1, 96, 12, 4507);
    			div3.className = "roi-group svelte-1qkr6hg";
    			add_location(div3, file$1, 87, 8, 3816);
    			div4.className = "roi-block svelte-1qkr6hg";
    			add_location(div4, file$1, 75, 4, 3155);
    			div5.className = "roi-wrapper svelte-1qkr6hg";
    			add_location(div5, file$1, 74, 0, 3125);

    			dispose = [
    				listen(input0, "input", ctx.input0_input_handler),
    				listen(input1, "input", ctx.input1_input_handler),
    				listen(input2, "input", ctx.input2_input_handler),
    				listen(input3, "input", ctx.input3_input_handler),
    				listen(input4, "input", ctx.input4_input_handler),
    				listen(input5, "input", ctx.input5_input_handler),
    				listen(div4, "change", ctx.change_handler)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div5, anchor);
    			append(div5, div4);
    			append(div4, h1);
    			append(div4, t1);
    			append(div4, div2);
    			append(div2, h20);
    			append(div2, t3);
    			append(div2, label0);
    			append(div2, t5);
    			append(div2, input0);

    			input0.value = ctx.team;

    			add_binding_callback(() => ctx.input0_binding(input0, null));
    			append(div2, t6);
    			append(div2, label1);
    			append(div2, t8);
    			append(div2, div1);
    			append(div1, input1);

    			input1.value = ctx.billable;

    			append(div1, t9);
    			append(div1, div0);
    			append(div0, t10);
    			append(div4, t11);
    			append(div4, div3);
    			append(div3, h21);
    			append(div3, t13);
    			append(div3, label2);
    			append(div3, t15);
    			append(div3, input2);

    			input2.value = ctx.assembling;

    			append(div3, t16);
    			append(div3, label3);
    			append(div3, t18);
    			append(div3, input3);

    			input3.value = ctx.collaborating;

    			append(div3, t19);
    			append(div3, label4);
    			append(div3, t21);
    			append(div3, input4);

    			input4.value = ctx.sendFeedback;

    			append(div3, t22);
    			append(div3, label5);
    			append(div3, t24);
    			append(div3, input5);

    			input5.value = ctx.communicationClient;

    			append(div5, t25);
    			if_block.m(div5, null);
    		},

    		p: function update(changed, ctx) {
    			if (changed.team) input0.value = ctx.team;
    			if (changed.items) {
    				ctx.input0_binding(null, input0);
    				ctx.input0_binding(input0, null);
    			}
    			if (changed.billable) input1.value = ctx.billable;
    			if (changed.assembling) input2.value = ctx.assembling;
    			if (changed.collaborating) input3.value = ctx.collaborating;
    			if (changed.sendFeedback) input4.value = ctx.sendFeedback;
    			if (changed.communicationClient) input5.value = ctx.communicationClient;

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(div5, null);
    				}
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div5);
    			}

    			ctx.input0_binding(null, input0);
    			if_block.d();
    			run_all(dispose);
    		}
    	};
    }

    let currency$1 = "$";

    let feedbackLoops = 3;

    function stripQueryString$1(href) {
        return href.split("?")[0];
    }

    function instance$1($$self, $$props, $$invalidate) {
    	const qsInput = (new URLSearchParams(window.location.search).get("roi_brand") || "").split("-");
        const initial = {
            team: parseInt(qsInput[0]) || 5,
            billable: parseInt(qsInput[1]) || 60000,
            assembling: parseInt(qsInput[2]) || 4,
            collaborating: parseFloat(qsInput[3]) || 1.5,
            sendFeedback: parseFloat(qsInput[4]) || 1.5,
            communicationClient: parseFloat(qsInput[5]) || 0.2
        };

        const decimalOptions = { style: "decimal", maximumFractionDigits: 1 };
        const integerOptions = { style: "decimal", maximumFractionDigits: 0 };
        const currencyOptions = { style: "currency", currency: "USD", maximumFractionDigits: 0, minimumFractionDigits: 0 };
        let showExplanation = qsInput.length < 2;
        let firstInput;
        let shareableLink;
        let linkCopyFeedback = false;

        let team = initial.team;
        let billable = initial.billable;
        let assembling = initial.assembling;
        let collaborating = initial.collaborating;
        let sendFeedback = initial.sendFeedback;
        let communicationClient = initial.communicationClient;

        function start() {
            $$invalidate('showExplanation', showExplanation = false);
            firstInput.focus();
            firstInput.select();
        }

        function copyLink(event) {
            event.preventDefault();
            navigator.clipboard.writeText(`${shareableLink}`);
            $$invalidate('linkCopyFeedback', linkCopyFeedback = true);
            setTimeout(() => { const $$result = linkCopyFeedback = false; $$invalidate('linkCopyFeedback', linkCopyFeedback); return $$result; }, 1500);
            return false;
        }

    	function input0_input_handler() {
    		team = to_number(this.value);
    		$$invalidate('team', team);
    	}

    	function input0_binding($$node, check) {
    		firstInput = $$node;
    		$$invalidate('firstInput', firstInput);
    	}

    	function input1_input_handler() {
    		billable = to_number(this.value);
    		$$invalidate('billable', billable);
    	}

    	function input2_input_handler() {
    		assembling = to_number(this.value);
    		$$invalidate('assembling', assembling);
    	}

    	function input3_input_handler() {
    		collaborating = to_number(this.value);
    		$$invalidate('collaborating', collaborating);
    	}

    	function input4_input_handler() {
    		sendFeedback = to_number(this.value);
    		$$invalidate('sendFeedback', sendFeedback);
    	}

    	function input5_input_handler() {
    		communicationClient = to_number(this.value);
    		$$invalidate('communicationClient', communicationClient);
    	}

    	function change_handler() {
    		const $$result = showExplanation = false;
    		$$invalidate('showExplanation', showExplanation);
    		return $$result;
    	}

    	let collaboratingProject, timeSendingApprovalsProject, feedbackCommunication, wastedHoursProject, opportunityCost, billableHoursYearly, revenueIncreaseDam, revenueIncreaseTeam, revenueIncreaseOrg;

    	$$self.$$.update = ($$dirty = { assembling: 1, collaborating: 1, sendFeedback: 1, feedbackLoops: 1, communicationClient: 1, collaboratingProject: 1, timeSendingApprovalsProject: 1, feedbackCommunication: 1, wastedHoursProject: 1, billable: 1, team: 1, billableHoursYearly: 1 }) => {
    		if ($$dirty.assembling || $$dirty.collaborating) { $$invalidate('collaboratingProject', collaboratingProject = (assembling || initial.assembling) + (collaborating || initial.collaborating)) ; }
    		if ($$dirty.sendFeedback || $$dirty.feedbackLoops) { $$invalidate('timeSendingApprovalsProject', timeSendingApprovalsProject = ((sendFeedback || initial.sendFeedback) * feedbackLoops)); }
    		if ($$dirty.feedbackLoops || $$dirty.communicationClient) { $$invalidate('feedbackCommunication', feedbackCommunication = (feedbackLoops * (communicationClient || initial.communicationClient) + feedbackLoops) / 60); }
    		if ($$dirty.collaboratingProject || $$dirty.timeSendingApprovalsProject || $$dirty.feedbackCommunication) { $$invalidate('wastedHoursProject', wastedHoursProject = collaboratingProject + timeSendingApprovalsProject + feedbackCommunication); }
    		if ($$dirty.wastedHoursProject || $$dirty.billable || $$dirty.team) { $$invalidate('opportunityCost', opportunityCost = wastedHoursProject * (billable || initial.billable)/52/5/8 * (team || initial.team)); }
    		if ($$dirty.wastedHoursProject) { $$invalidate('billableHoursYearly', billableHoursYearly = wastedHoursProject * 52); }
    		if ($$dirty.billableHoursYearly || $$dirty.billable || $$dirty.team) { $$invalidate('revenueIncreaseDam', revenueIncreaseDam = billableHoursYearly * (billable || initial.billable) /12/20/8 * (team || initial.team)); }
    		if ($$dirty.billableHoursYearly || $$dirty.billable || $$dirty.team) { $$invalidate('revenueIncreaseTeam', revenueIncreaseTeam = billableHoursYearly * (billable || initial.billable) /12/20/8 * (team || initial.team) - (539 * 12)); }
    		if ($$dirty.billableHoursYearly || $$dirty.billable || $$dirty.team) { $$invalidate('revenueIncreaseOrg', revenueIncreaseOrg = billableHoursYearly * (billable || initial.billable) /12/4/5/8 * (team || initial.team) - (889 * 12)); }
    		if ($$dirty.team || $$dirty.billable || $$dirty.assembling || $$dirty.collaborating || $$dirty.sendFeedback || $$dirty.communicationClient) { {
                    const data = [
                        Math.abs(team),
                        Math.abs(billable),
                        Math.abs(assembling),
                        Math.abs(collaborating),
                        Math.abs(sendFeedback),
                        Math.abs(communicationClient)
                    ];
                    const qs = new URLSearchParams(window.location.search);
                    qs.set("roi_brand", data.join("-"));
                    $$invalidate('shareableLink', shareableLink = `${stripQueryString$1(window.location.href)}?${qs.toString()}`);
                } }
    	};

    	return {
    		initial,
    		decimalOptions,
    		integerOptions,
    		currencyOptions,
    		showExplanation,
    		firstInput,
    		shareableLink,
    		linkCopyFeedback,
    		team,
    		billable,
    		assembling,
    		collaborating,
    		sendFeedback,
    		communicationClient,
    		start,
    		copyLink,
    		wastedHoursProject,
    		opportunityCost,
    		billableHoursYearly,
    		revenueIncreaseDam,
    		revenueIncreaseTeam,
    		revenueIncreaseOrg,
    		input0_input_handler,
    		input0_binding,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		change_handler
    	};
    }

    class RoiCalculatorBrands extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    	}
    }

    const calculator = new RoiCalculator({
    	target: document.getElementById('roi-calculator')
    });

    const calculatorBrands = new RoiCalculatorBrands({
    	target: document.getElementById('roi-calculator-brands')
    });

    exports.calculator = calculator;
    exports.calculatorBrands = calculatorBrands;
    exports.togglePrices = togglePrices;

    return exports;

}({}));
//# sourceMappingURL=bundle.js.map
