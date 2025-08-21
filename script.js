document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos do DOM ---
    const overlay = document.getElementById('tutorial-overlay');
    const tooltip = document.getElementById('tutorial-tooltip');
    const tooltipIcon = document.getElementById('tooltip-icon');
    const tooltipTitle = document.getElementById('tooltip-title');
    const tooltipText = document.getElementById('tooltip-text');
    const nextBtn = document.getElementById('tooltip-next-btn');
    const addItemBtn = document.getElementById('add-item-btn');
    
    let formModal;
    let currentStep = 0; // CORREÇÃO: Iniciar no passo 0
    let newCard = null;

    // --- Definição dos Passos do Tutorial ---
    const tutorialSteps = [
        { // Passo 0
            title: "Passo 1: Entendendo o Painel",
            text: "Este é o seu painel de controle. Cada coluna representa uma etapa do processo de cadastro de produtos.",
            target: () => document.querySelector('.kanban-board')
        },
        { // Passo 1
            title: "Passo 2: Crie uma Nova Solicitação",
            text: "Para iniciar um novo cadastro, clique no botão '+ Adicionar novo item'. Vamos, pode clicar!",
            target: () => addItemBtn,
            interactive: true
        },
        { // Passo 2
            title: "Passo 3: Arraste para Iniciar o Fluxo",
            text: "Perfeito! Seu cartão foi criado. Agora, clique e arraste-o para a coluna '2ª Etapa - Cadastro PCP' para continuar.",
            target: () => newCard,
            interactive: true
        },
        { // Passo 3
            title: "Passo 4: Notificações Automáticas",
            icon: '📧',
            text: "Excelente! Neste momento, um e-mail automático foi enviado para o responsável pelo PCP, avisando sobre a nova tarefa. O sistema também libera novos campos no cartão para preenchimento.",
            target: () => newCard
        },
        { // Passo 4
            title: "Visão Geral do Processo",
            icon: '⚙️',
            text: "O fluxo continua assim até a 5ª etapa, após finalizado mover para concluido! . O sistema também envia lembretes se uma tarefa ficar parada por mais de 24h. No final, um PDF do cadastro é salvo automaticamente para consulta.",
            target: () => document.querySelector('.kanban-board')
        },
        { // Passo 5
            title: "Fim do Tutorial",
            icon: '✅',
            text: "Você concluiu o guia! Agora você pode fechar esta aba e voltar para a página principal para usar o sistema real.",
            target: () => document.querySelector('header')
        }
    ];
    
    // --- Funções do Tutorial ---
    // --- Funções do Tutorial ---
function showTooltip(stepIndex) {
    document.querySelectorAll('.highlight-element').forEach(el => el.classList.remove('highlight-element'));
    if (!tutorialSteps[stepIndex]) {
        overlay.classList.add('hidden');
        return;
    }
    const { title, text, icon, target, interactive } = tutorialSteps[stepIndex];
    const targetElement = target();
    if (targetElement) {
        targetElement.classList.add('highlight-element');
        const rect = targetElement.getBoundingClientRect();
        // *** INÍCIO DA LÓGICA DE POSICIONAMENTO CORRIGIDA ***
        const tooltipHeight = tooltip.offsetHeight; // Mede a altura do tooltip
        const spaceBelow = window.innerHeight - rect.bottom; // Calcula o espaço abaixo do elemento
        const margin = 15; // Uma pequena margem de segurança
        // Se o espaço abaixo não for suficiente para o tooltip, posiciona ACIMA.
        if (spaceBelow < (tooltipHeight + margin)) {
            tooltip.style.top = `${window.scrollY + rect.top - tooltipHeight - margin}px`;
        } 
        // Senão, posiciona ABAIXO (comportamento padrão).
        else {
            tooltip.style.top = `${window.scrollY + rect.bottom + margin}px`;
        }
        // *** FIM DA LÓGICA DE POSICIONAMENTO CORRIGIDA ***
        tooltip.style.left = `${window.scrollX + rect.left}px`;
        // Ajusta se sair da tela lateralmente
        if (rect.left + 350 > window.innerWidth) tooltip.style.left = `${window.innerWidth - 360}px`;
    }
    tooltipTitle.textContent = title;
    tooltipText.textContent = text;
    tooltipIcon.textContent = icon || '';
    overlay.classList.toggle('interactive-mode', !!interactive);
    overlay.classList.remove('hidden');
    tooltip.classList.remove('hidden');
    nextBtn.classList.toggle('hidden', !!interactive);
    nextBtn.textContent = (stepIndex === tutorialSteps.length - 1) ? 'Fechar' : 'Próximo';
    nextBtn.setAttribute('data-step', stepIndex); // Guarda o passo atual no botão
}

    function advanceTutorial() {
        currentStep++;
        if (formModal) formModal.remove();
        showTooltip(currentStep);
    }
    
    function createFormModal() {
        tooltip.classList.add('hidden');
        overlay.classList.remove('interactive-mode');
        
        formModal = document.createElement('div');
        formModal.id = 'form-modal';
        formModal.style.position = 'absolute';
        formModal.style.top = '50%';
        formModal.style.left = '50%';
        formModal.style.transform = 'translate(-50%, -50%)';
        formModal.innerHTML = `...`; // O restante do HTML do modal
        formModal.innerHTML = `
            <h3>Adicionar Novo Item (Simulação)</h3>
            <label for="card-name">Nome do Produto:</label>
            <input type="text" id="card-name" value="Teste de Produto - ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}">
            <button id="save-card-btn" class="add-button">Salvar</button>
        `;

        document.body.appendChild(formModal);

        const cardNameInput = document.getElementById('card-name');
        const saveCardBtn = document.getElementById('save-card-btn');
        cardNameInput.focus();

        saveCardBtn.addEventListener('click', () => {
            const cardName = cardNameInput.value || "Produto Teste";
            newCard = document.createElement('div');
            newCard.className = 'card';
            newCard.innerHTML = `<strong>${cardName}</strong><p>Solicitado por: Você</p>`;
            document.getElementById('cards-1').appendChild(newCard); // Adiciona na "1ª Etapa"
            advanceTutorial();
        });
    }

    // --- Eventos ---
    nextBtn.addEventListener('click', advanceTutorial);

    addItemBtn.addEventListener('click', () => {
        if (currentStep === 1) createFormModal();
    });

    // --- Configuração do Arrastar e Soltar (SortableJS) ---
    document.querySelectorAll('.cards-container').forEach(container => {
        new Sortable(container, {
            group: 'kanban',
            animation: 150,
            onEnd: (evt) => {
                if (currentStep === 2 && evt.item === newCard && evt.to.id === 'cards-2') {
                    advanceTutorial();
                }
            }
        });
    });

    // --- Iniciar o tutorial ---
    showTooltip(currentStep); // Mostra o primeiro passo (índice 0)

});
