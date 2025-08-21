// script.js

let currentUnit = 'metric';
let imcHistory = JSON.parse(localStorage.getItem('imcHistory')) || [];

// Inicializar gráfico
const ctx = document.getElementById('imcChart').getContext('2d');
const imcChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Bajo peso (8%)', 'Normal (36%)', 'Sobrepeso (30%)', 'Obesidad (26%)'],
        datasets: [{
            data: [8, 36, 30, 26],
            backgroundColor: [
                '#bee3f8',
                '#c6f6d5',
                '#fbb6ce',
                '#feb2b2'
            ],
            borderWidth: 0
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 40,
                    font: { size: 14 }
                }
            },
            title: {
                display: true,
                text: 'Distribución estimada del IMC en adultos a nivel global',
                font: { size: 16 },
                padding: 40,
            }
        }
    }
});

function toggleUnit(unit) {
    currentUnit = unit;
    const buttons = document.querySelectorAll('.unit-toggle button');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const heightUnit = document.getElementById('heightUnit');
    const weightUnit = document.getElementById('weightUnit');
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');

    if (unit === 'metric') {
        heightUnit.textContent = 'cm';
        weightUnit.textContent = 'kg';
        heightInput.placeholder = 'ej: 170';
        weightInput.placeholder = 'ej: 70';
    } else {
        heightUnit.textContent = 'in';
        weightUnit.textContent = 'lbs';
        heightInput.placeholder = 'ej: 67';
        weightInput.placeholder = 'ej: 154';
    }

    heightInput.value = '';
    weightInput.value = '';
}

function calculateIMC(height, weight, unit) {
    if (unit === 'imperial') {
        height = height * 0.0254;
        weight = weight * 0.453592;
    } else {
        height = height / 100;
    }
    return weight / (height * height);
}

function getIMCCategory(imc) {
    if (imc < 18.5) return { category: 'Bajo peso', class: 'underweight' };
    if (imc < 25) return { category: 'Normal', class: 'normal' };
    if (imc < 30) return { category: 'Sobrepeso', class: 'overweight' };
    return { category: 'Obesidad', class: 'obese' };
}

function getRecommendations(imc, age, gender) {
    const category = getIMCCategory(imc);
    let recommendations = [];

    switch (category.class) {
        case 'underweight':
            recommendations = [
                'Consulta con un nutricionista para aumentar peso de forma saludable',
                'Incluye más proteínas y grasas saludables en tu dieta',
                'Realiza ejercicios de fortalecimiento muscular',
                'Come porciones más frecuentes durante el día'
            ];
            break;
        case 'normal':
            recommendations = [
                '¡Felicidades! Mantén tu peso actual con hábitos saludables',
                'Continúa con una dieta balanceada y ejercicio regular',
                'Realiza chequeos médicos preventivos',
                'Mantente hidratado y duerme bien'
            ];
            break;
        case 'overweight':
            recommendations = [
                'Considera reducir 5-10% de tu peso actual',
                'Aumenta la actividad física gradualmente',
                'Reduce las porciones y evita alimentos procesados',
                'Consulta con un profesional de la salud'
            ];
            break;
        case 'obese':
            recommendations = [
                'Es importante consultar con un médico especialista',
                'Considera un plan de pérdida de peso supervisado',
                'Incorpora actividad física de bajo impacto',
                'Busca apoyo nutricional profesional'
            ];
            break;
    }

    if (age) {
        if (age > 65) {
            recommendations.push('Mantén la masa muscular con ejercicios de resistencia');
        }
        if (age < 18) {
            recommendations.push('El crecimiento aún continúa, consulta con pediatra');
        }
    }

    return recommendations;
}

function saveToHistory(height, weight, imc, category, age, gender) {
    const entry = {
        date: new Date().toLocaleDateString(),
        height: height,
        weight: weight,
        imc: imc.toFixed(1),
        category: category,
        age: age || 'No especificada',
        gender: gender || 'No especificado'
    };

    imcHistory.unshift(entry);
    if (imcHistory.length > 10) imcHistory.pop();
    localStorage.setItem('imcHistory', JSON.stringify(imcHistory));
    displayHistory();
}

function displayHistory() {
    const historyDiv = document.getElementById('history');
    if (imcHistory.length === 0) {
        historyDiv.innerHTML = '<p style="color: #718096; font-style: italic;">No hay cálculos previos</p>';
        return;
    }
    historyDiv.innerHTML = imcHistory.map(entry => `
        <div class="history-item">
            <div>
                <strong>IMC: ${entry.imc}</strong> - ${entry.category}<br>
                <small>${entry.date}</small>
            </div>
            <div style="text-align: right; font-size: 0.9em; color: #718096;">
                ${entry.height}${currentUnit === 'metric' ? 'cm' : 'in'} / ${entry.weight}${currentUnit === 'metric' ? 'kg' : 'lbs'}
            </div>
        </div>
    `).join('');
}

function clearHistory() {
    imcHistory = [];
    localStorage.removeItem('imcHistory');
    displayHistory();
}

document.getElementById('imcForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;

    if (!height || !weight) {
        alert('Por favor, ingresa altura y peso válidos.');
        return;
    }

    const imc = calculateIMC(height, weight, currentUnit);
    const categoryInfo = getIMCCategory(imc);
    const recommendations = getRecommendations(imc, age, gender);

    document.getElementById('imcValue').textContent = imc.toFixed(1);
    const categoryElement = document.getElementById('imcCategory');
    categoryElement.textContent = categoryInfo.category;
    categoryElement.className = `imc-category ${categoryInfo.class}`;

    const recommendationsDiv = document.getElementById('recommendations');
    recommendationsDiv.innerHTML = `
        <h4>Recomendaciones Personalizadas:</h4>
        <ul>${recommendations.map(rec => `<li>${rec}</li>`).join('')}</ul>
    `;

    document.getElementById('result').classList.add('show');
    saveToHistory(height, weight, imc, categoryInfo.category, age, gender);
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
});

displayHistory();

document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.info-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});
