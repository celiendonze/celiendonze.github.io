// Hardware Presets configurations based on typical benchmarks (e.g. Llama 3 8B inference)
const presets = {
    rtx3090: {
        price: 1000,
        years: 3,
        utilization: 50,
        electricity: 0.15,
        pue: 1.20,
        activePower: 350,
        idlePower: 25,
        speedInput: 400,
        speedOutput: 65,
        speedRead: 1200,
        speedWrite: 800
    },
    rtx4090: {
        price: 2000,
        years: 3,
        utilization: 50,
        electricity: 0.15,
        pue: 1.20,
        activePower: 450,
        idlePower: 30,
        speedInput: 800,
        speedOutput: 100,
        speedRead: 2400,
        speedWrite: 1600
    },
    rtx5090: {
        price: 2500,
        years: 3,
        utilization: 50,
        electricity: 0.15,
        pue: 1.20,
        activePower: 600,
        idlePower: 40,
        speedInput: 1500,
        speedOutput: 150,
        speedRead: 4500,
        speedWrite: 3000
    },
    rtx6000: {
        price: 8565,
        years: 3,
        utilization: 50,
        electricity: 0.15,
        pue: 1.20,
        activePower: 600,
        idlePower: 30,
        speedInput: 2000,
        speedOutput: 150,
        speedRead: 4500,
        speedWrite: 3000
    },
    h100: {
        price: 35000,
        years: 3,
        utilization: 50,
        electricity: 0.15,
        pue: 1.20,
        activePower: 1024,
        idlePower: 100,
        speedInput: 5000,
        speedOutput: 150,
        speedRead: 15000,
        speedWrite: 10000
    },
    blackwell: {
        price: 40000,
        years: 3,
        utilization: 50,
        electricity: 0.15,
        pue: 1.20,
        activePower: 1200,
        idlePower: 150,
        speedInput: 8000,
        speedOutput: 300,
        speedRead: 24000,
        speedWrite: 16000
    },
    m3ultra: {
        price: 7000,
        years: 3,
        utilization: 50,
        electricity: 0.15,
        pue: 1.10,
        activePower: 120,
        idlePower: 15,
        speedInput: 450,
        speedOutput: 50,
        speedRead: 1350,
        speedWrite: 900
    }
};

// Global Chart Instance
let costChart = null;

// DOM Elements
const selectPreset = document.getElementById('hardware-preset');

// Parameters Input & Sliders
const inputs = {
    price: { num: document.getElementById('hardware-price'), slider: document.getElementById('hardware-price-slider') },
    years: { num: document.getElementById('years-profitable'), slider: document.getElementById('years-profitable-slider') },
    utilization: { num: document.getElementById('utilization'), slider: document.getElementById('utilization-slider') },
    electricity: { num: document.getElementById('electricity-cost'), slider: document.getElementById('electricity-cost-slider') },
    pue: { num: document.getElementById('pue'), slider: document.getElementById('pue-slider') },
    activePower: { num: document.getElementById('active-power'), slider: document.getElementById('active-power-slider') },
    idlePower: { num: document.getElementById('idle-power'), slider: document.getElementById('idle-power-slider') },
    speedInput: { num: document.getElementById('speed-input') },
    speedOutput: { num: document.getElementById('speed-output') },
    speedRead: { num: document.getElementById('speed-cache-read') },
    speedWrite: { num: document.getElementById('speed-cache-write') }
};

// Blended Calculator Elements
const blendedInputs = {
    inputTokens: document.getElementById('prompt-input-tokens'),
    outputTokens: document.getElementById('prompt-output-tokens'),
    readTokens: document.getElementById('prompt-read-tokens'),
    writeTokens: document.getElementById('prompt-write-tokens'),
    frequency: document.getElementById('prompt-frequency')
};

// Store current calculated cost per million tokens to reuse in blended calculator
let calculatedCosts = {
    input: 0,
    output: 0,
    read: 0,
    write: 0
};

// Formatting helpers
function formatUSD(val, maxDecimals = 4) {
    return '$' + val.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: maxDecimals
    });
}

function formatUSDPrecise(val) {
    if (val === 0) return '$0.000000';
    if (val < 0.000001) return '$' + val.toFixed(8);
    return '$' + val.toFixed(6);
}

// Bind sliders and inputs
function initSliders() {
    Object.keys(inputs).forEach(key => {
        const field = inputs[key];
        if (field.num && field.slider) {
            // Numeric Input event
            field.num.addEventListener('input', () => {
                let val = parseFloat(field.num.value);
                if (isNaN(val)) return;
                
                // Keep within slider bounds for smooth visual tracking
                const min = parseFloat(field.slider.min);
                const max = parseFloat(field.slider.max);
                if (val < min) val = min;
                if (val > max) val = max;
                
                field.slider.value = val;
                selectPreset.value = 'custom';
                updateCalculations();
            });

            // Slider event
            field.slider.addEventListener('input', () => {
                field.num.value = field.slider.value;
                selectPreset.value = 'custom';
                updateCalculations();
            });
        } else if (field.num) {
            // Speed fields don't have sliders
            field.num.addEventListener('input', () => {
                selectPreset.value = 'custom';
                updateCalculations();
            });
        }
    });

    // Blended calculator events
    Object.keys(blendedInputs).forEach(key => {
        blendedInputs[key].addEventListener('input', updateCalculations);
    });
}

// Apply Hardware Preset
function applyPreset(presetKey) {
    const preset = presets[presetKey];
    if (!preset) return;

    Object.keys(preset).forEach(key => {
        if (inputs[key]) {
            inputs[key].num.value = preset[key];
            if (inputs[key].slider) {
                inputs[key].slider.value = preset[key];
            }
        }
    });

    updateCalculations();
}

// Perform cost math and update UI
function updateCalculations() {
    // 1. Gather parameter values
    const price = parseFloat(inputs.price.num.value) || 0;
    const years = parseFloat(inputs.years.num.value) || 1;
    const utilization = (parseFloat(inputs.utilization.num.value) || 1) / 100; // as fraction e.g. 0.50
    const electricity = parseFloat(inputs.electricity.num.value) || 0;
    const pue = parseFloat(inputs.pue.num.value) || 1.0;
    const activePower = parseFloat(inputs.activePower.num.value) || 0;
    const idlePower = parseFloat(inputs.idlePower.num.value) || 0;

    const speedInput = parseFloat(inputs.speedInput.num.value) || 1;
    const speedOutput = parseFloat(inputs.speedOutput.num.value) || 1;
    const speedRead = parseFloat(inputs.speedRead.num.value) || 1;
    const speedWrite = parseFloat(inputs.speedWrite.num.value) || 1;

    // Update speeds visual labels
    document.getElementById('lbl-input-speed').textContent = speedInput.toLocaleString();
    document.getElementById('lbl-output-speed').textContent = speedOutput.toLocaleString();
    document.getElementById('lbl-read-speed').textContent = speedRead.toLocaleString();
    document.getElementById('lbl-write-speed').textContent = speedWrite.toLocaleString();

    // 2. Base Amortization & Operating Cost Calculations (Hourly)
    const totalHours = years * 365.25 * 24;
    const capexPerHour = price / totalHours;

    // Power costs
    const avgPower = (utilization * activePower) + ((1 - utilization) * idlePower);
    const avgPowerKw = avgPower / 1000;
    
    // Break down power components
    const hardwarePowerCostPerHour = avgPowerKw * electricity;
    const coolingCostPerHour = avgPowerKw * (pue - 1.0) * electricity;
    const opexPerHour = avgPowerKw * pue * electricity;

    const totalCostPerHour = capexPerHour + opexPerHour;
    
    // 3. Allocated Cost Per Active Hour (Factor in idle periods)
    // Both CapEx and idle OpEx are divided by utilization, representing their amortization over active token generation periods.
    const costPerActiveHour = totalCostPerHour / utilization;

    // 4. Cost of 1 Million Tokens per type
    // Formula: (1,000,000 / Speed) in seconds -> convert to hours -> multiply by cost per active hour
    const secToHour = 1 / 3600;
    const calcTokenCost = (speed) => (1000000 / speed) * secToHour * costPerActiveHour;

    calculatedCosts.input = calcTokenCost(speedInput);
    calculatedCosts.output = calcTokenCost(speedOutput);
    calculatedCosts.read = calcTokenCost(speedRead);
    calculatedCosts.write = calcTokenCost(speedWrite);

    // Update dynamic metric cards
    document.getElementById('metric-input-cost').textContent = formatUSD(calculatedCosts.input);
    document.getElementById('metric-output-cost').textContent = formatUSD(calculatedCosts.output);
    document.getElementById('metric-read-cost').textContent = formatUSD(calculatedCosts.read);
    document.getElementById('metric-write-cost').textContent = formatUSD(calculatedCosts.write);

    // Update hourly summary bar
    document.getElementById('summary-capex-hr').textContent = formatUSD(capexPerHour, 3);
    document.getElementById('summary-opex-hr').textContent = formatUSD(opexPerHour, 3);
    document.getElementById('summary-power-avg').textContent = `${Math.round(avgPower)} W`;
    document.getElementById('summary-total-hr').textContent = formatUSD(totalCostPerHour, 3);

    // Update TCO breakdown table
    document.getElementById('tbl-capex-hr').textContent = formatUSD(capexPerHour, 3);
    document.getElementById('tbl-capex-yr').textContent = formatUSD(capexPerHour * 8766, 2);
    document.getElementById('tbl-capex-pct').textContent = `${Math.round((capexPerHour / totalCostPerHour) * 100)}%`;

    document.getElementById('tbl-power-hr').textContent = formatUSD(hardwarePowerCostPerHour, 3);
    document.getElementById('tbl-power-yr').textContent = formatUSD(hardwarePowerCostPerHour * 8766, 2);
    document.getElementById('tbl-power-pct').textContent = `${Math.round((hardwarePowerCostPerHour / totalCostPerHour) * 100)}%`;

    document.getElementById('tbl-cooling-hr').textContent = formatUSD(coolingCostPerHour, 3);
    document.getElementById('tbl-cooling-yr').textContent = formatUSD(coolingCostPerHour * 8766, 2);
    document.getElementById('tbl-cooling-pct').textContent = `${Math.round((coolingCostPerHour / totalCostPerHour) * 100)}%`;

    document.getElementById('tbl-total-hr').textContent = formatUSD(totalCostPerHour, 2);
    document.getElementById('tbl-total-yr').textContent = formatUSD(totalCostPerHour * 8766, 2);

    // 5. Update Chart.js visualization
    renderChart(calculatedCosts);

    // 6. Update Blended Calculator tab values
    updateBlendedCalculator();
}

// Blended prompt cost logic
function updateBlendedCalculator() {
    const promptInput = parseFloat(blendedInputs.inputTokens.value) || 0;
    const promptOutput = parseFloat(blendedInputs.outputTokens.value) || 0;
    const promptRead = parseFloat(blendedInputs.readTokens.value) || 0;
    const promptWrite = parseFloat(blendedInputs.writeTokens.value) || 0;
    const dailyFrequency = parseFloat(blendedInputs.frequency.value) || 0;

    // Calculate prompt speed factors
    const speedInput = parseFloat(inputs.speedInput.num.value) || 1;
    const speedOutput = parseFloat(inputs.speedOutput.num.value) || 1;
    const speedRead = parseFloat(inputs.speedRead.num.value) || 1;
    const speedWrite = parseFloat(inputs.speedWrite.num.value) || 1;

    // Compute cost per individual prompt execution
    const costInput = (promptInput / 1000000) * calculatedCosts.input;
    const costOutput = (promptOutput / 1000000) * calculatedCosts.output;
    const costRead = (promptRead / 1000000) * calculatedCosts.read;
    const costWrite = (promptWrite / 1000000) * calculatedCosts.write;

    const singlePromptCost = costInput + costOutput + costRead + costWrite;

    // Compute duration
    const executionTimeSeconds = (promptInput / speedInput) + (promptOutput / speedOutput) + (promptRead / speedRead) + (promptWrite / speedWrite);

    // Projections
    const costDay = singlePromptCost * dailyFrequency;
    const costMonth = costDay * 30;
    const costYear = costDay * 365.25;

    // Effective blended token rate per million
    const totalTokens = promptInput + promptOutput + promptRead + promptWrite;
    const blendedRatePerMillion = totalTokens > 0 ? (singlePromptCost / totalTokens) * 1000000 : 0;

    // Update UI elements
    document.getElementById('calc-prompt-cost').textContent = formatUSDPrecise(singlePromptCost);
    document.getElementById('calc-prompt-time').textContent = `${executionTimeSeconds.toFixed(3)}s`;
    document.getElementById('calc-cost-day').textContent = formatUSD(costDay, 2);
    document.getElementById('calc-cost-month').textContent = formatUSD(costMonth, 2);
    document.getElementById('calc-cost-year').textContent = formatUSD(costYear, 2);
    document.getElementById('calc-cost-million-blended').textContent = formatUSD(blendedRatePerMillion, 2);
}

// Chart.js initialization and updates
function renderChart(data) {
    const ctx = document.getElementById('costChart');
    if (!ctx) return;

    const chartData = [data.input, data.output, data.read, data.write];

    if (costChart) {
        costChart.data.datasets[0].data = chartData;
        costChart.update();
    } else {
        costChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Input (Prefill)', 'Output (Decode)', 'Cache Read', 'Cache Write'],
                datasets: [{
                    label: 'Cost per 1M Tokens (USD)',
                    data: chartData,
                    backgroundColor: [
                        'rgba(6, 182, 212, 0.8)', // Cyan
                        'rgba(249, 115, 22, 0.8)', // Orange
                        'rgba(14, 116, 144, 0.8)', // Cyan Dark
                        'rgba(194, 65, 12, 0.8)'  // Orange Dark
                    ],
                    borderColor: [
                        '#06b6d4',
                        '#f97316',
                        '#0e7490',
                        '#c2410c'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Cost: $${context.raw.toFixed(4)}`;
                            }
                        },
                        titleFont: { family: 'JetBrains Mono' },
                        bodyFont: { family: 'JetBrains Mono' },
                        backgroundColor: '#09090b',
                        borderColor: '#27272a',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        grid: {
                            color: '#1f1f23'
                        },
                        ticks: {
                            color: '#a1a1aa',
                            font: { family: 'JetBrains Mono', size: 10 },
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        },
                        border: {
                            color: '#27272a'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#a1a1aa',
                            font: { family: 'JetBrains Mono', size: 10 }
                        },
                        border: {
                            color: '#27272a'
                        }
                    }
                }
            }
        });
    }
}

// Tab switcher logic
function initTabs() {
    const tabPricing = document.getElementById('tab-pricing');
    const tabBlended = document.getElementById('tab-blended');
    const viewPricing = document.getElementById('view-pricing');
    const viewBlended = document.getElementById('view-blended');

    tabPricing.addEventListener('click', () => {
        tabPricing.classList.add('active');
        tabPricing.setAttribute('aria-selected', 'true');
        tabPricing.setAttribute('tabindex', '0');

        tabBlended.classList.remove('active');
        tabBlended.setAttribute('aria-selected', 'false');
        tabBlended.setAttribute('tabindex', '-1');

        viewPricing.classList.add('active');
        viewBlended.classList.remove('active');

        // Resize chart if loaded in background
        if (costChart) {
            costChart.resize();
        }
    });

    tabBlended.addEventListener('click', () => {
        tabBlended.classList.add('active');
        tabBlended.setAttribute('aria-selected', 'true');
        tabBlended.setAttribute('tabindex', '0');

        tabPricing.classList.remove('active');
        tabPricing.setAttribute('aria-selected', 'false');
        tabPricing.setAttribute('tabindex', '-1');

        viewBlended.classList.add('active');
        viewPricing.classList.remove('active');
    });

    // Keyboard navigation for tabs
    const tabs = [tabPricing, tabBlended];
    let focusIdx = 0;
    
    tabs.forEach((tab, idx) => {
        tab.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                focusIdx = (idx + 1) % tabs.length;
                tabs[focusIdx].focus();
                tabs[focusIdx].click();
            } else if (e.key === 'ArrowLeft') {
                focusIdx = (idx - 1 + tabs.length) % tabs.length;
                tabs[focusIdx].focus();
                tabs[focusIdx].click();
            }
        });
    });
}

// Setup Event Listeners
selectPreset.addEventListener('change', () => {
    const val = selectPreset.value;
    if (val !== 'custom') {
        applyPreset(val);
    }
});

// Run Init
window.addEventListener('DOMContentLoaded', () => {
    initSliders();
    initTabs();
    applyPreset('rtx3090'); // Default start preset
});
