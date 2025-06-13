const BASE_URL = 'http://localhost:3000/api';

// --- Funções de Utilitário para Requisições ao Backend ---
async function fetchData(url, method = 'GET', body = null) {
    const token = localStorage.getItem('splitBankToken'); // Obter o token JWT salvo
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers,
        ...(body && { body: JSON.stringify(body) }),
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        if (!response.ok) {
            // Cria um erro com a mensagem da API se a resposta não for OK
            const error = new Error(data.message || 'Something went wrong');
            error.statusCode = response.status;
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        // Em vez de alert(), você pode usar um modal customizado para erros
        // Para este exemplo, usaremos alert() conforme seu código original
        const errorMessage = error.message || 'Erro de conexão com o servidor. Tente novamente.';
        alert(errorMessage);
        throw error;
    }
}

// --- Funções de Navegação (mantidas como no seu original) ---
function irParaLogin() {
  window.location.href = "login.html";
}

function irParaCadastro() {
  window.location.href = "cadastro.html";
}

// --- Funções de UI (toggle de senha, etc.) ---
function toggleSenha(id) {
  const input = document.getElementById(id);
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

// --- Funções de Integração com o Backend ---

// Lógica para lidar com o formulário de Cadastro
async function handleRegister(event) {
    event.preventDefault(); // Impede o recarregamento da página

    // Captura os valores dos campos do formulário
    const name = document.querySelector('.login-form input:nth-child(2)').value; // Primeiro input é nome
    const email = document.querySelector('.login-form input:nth-child(4)').value; // Segundo input é email
    const phone = document.querySelector('.login-form input:nth-child(6)').value; // Terceiro input é número
    const birthDate = document.querySelector('.login-form input:nth-child(8)').value; // Quarto input é data de aniversário
    const cpf = document.querySelector('.login-form input:nth-child(10)').value; // Quinto input é CPF
    const password = document.getElementById('senha').value;
    const confirmPassword = document.getElementById('confirma').value;

    if (password !== confirmPassword) {
        alert('As senhas não coincidem!');
        return;
    }

    try {
        const data = await fetchData(`${BASE_URL}/auth/register`, 'POST', {
            name,
            email,
            phone,
            birthDate,
            cpf,
            password
        });
        console.log('Registro bem-sucedido:', data);
        localStorage.setItem('splitBankToken', data.token); // Salva o token JWT
        localStorage.setItem('splitBankUserName', data.user.name); // Salva o nome do usuário
        localStorage.setItem('splitBankUserId', data.user.id); // Salva o ID do usuário
        alert('Cadastro realizado com sucesso! Bem-vindo(a) ao SplitBank.');
        window.location.href = 'home.html'; // Redireciona para a home
    } catch (error) {
        console.error('Erro no cadastro:', error);
        alert('Falha no cadastro. Verifique os dados e tente novamente.');
    }
}

// Lógica para lidar com o formulário de Login
async function handleLogin(event) {
    event.preventDefault(); // Impede o recarregamento da página

    const cpf = document.getElementById('cpf').value;
    const password = document.getElementById('senha').value;

    try {
        const data = await fetchData(`${BASE_URL}/auth/login`, 'POST', { cpf, password });
        console.log('Login bem-sucedido:', data);
        localStorage.setItem('splitBankToken', data.token); // Salva o token JWT
        localStorage.setItem('splitBankUserName', data.user.name); // Salva o nome do usuário
        localStorage.setItem('splitBankUserId', data.user.id); // Salva o ID do usuário
        alert(`Bem-vindo(a) de volta, ${data.user.name || 'usuário'}!`);
        window.location.href = 'home.html'; // Redireciona para a home após o login
    } catch (error) {
        console.error('Erro no login:', error);
        alert('Falha no login. Verifique seu CPF e senha.');
    }
}

// Lógica para carregar dados da Home Page
async function loadHomePageData() {
    const userNameElement = document.getElementById('welcomeUserName'); // Adicionar ID ao elemento 'Olá Stela'
    const totalBalanceElement = document.getElementById('totalBalanceAmount'); // Adicionar ID ao elemento de saldo
    const totalExpensesElement = document.getElementById('totalExpensesAmount'); // Adicionar ID ao elemento de despesa total
    const sharedExpensesValueElement = document.getElementById('sharedExpensesValue'); // Adicionar ID ao elemento de despesas divididas

    const userName = localStorage.getItem('splitBankUserName');
    if (userNameElement && userName) {
        userNameElement.textContent = `Olá ${userName},`;
    }

    try {
        const summary = await fetchData(`${BASE_URL}/wallets/summary`);
        if (totalBalanceElement) totalBalanceElement.textContent = `R$${summary.totalBalance.toFixed(2).replace('.', ',')}`;
        if (totalExpensesElement) totalExpensesElement.textContent = `-R$${Math.abs(summary.totalExpenses).toFixed(2).replace('.', ',')}`;
        if (sharedExpensesValueElement) sharedExpensesValueElement.textContent = `R$${summary.sharedExpensesTotal.toFixed(2).replace('.', ',')}`;

        // Atualizar a barra de progresso, se houver lógica para isso
        const progressBarFill = document.getElementById('progressBarFill'); // Adicionar ID ao elemento de preenchimento da barra
        if (progressBarFill && summary.totalExpenses !== 0) {
            // Exemplo simples: porcentagem de despesa em relação ao saldo (adapte sua lógica real)
            const progress = (Math.abs(summary.totalExpenses) / Math.abs(summary.totalBalance)) * 100;
            progressBarFill.style.width = `${Math.min(progress, 100)}%`; // Limita a 100%
        }
        const progressText = document.getElementById('progressText'); // Adicionar ID ao texto da barra
        if (progressText && summary.totalExpenses !== 0) {
             const progressPercentage = (Math.abs(summary.totalExpenses) / Math.abs(summary.totalBalance)) * 100;
             progressText.textContent = `${progressPercentage.toFixed(0)}% Das Suas Despesas, Parece Bom.`;
        }

        // Carregar atividades recentes (exemplo com dados mockados por enquanto, mas viria do backend)
        // Você precisaria de uma rota no backend para atividades recentes se quiser dinâmico
        const recentActivitiesList = document.getElementById('recentActivitiesList'); // Adicionar ID
        if (recentActivitiesList) {
            // Limpa a lista existente
            recentActivitiesList.innerHTML = `
                <li>
                    <span class="activity-icon">&#128176;</span> <div class="activity-details">
                        <h3>Salário</h3>
                        <p>18:27 – Abril 30</p>
                    </div>
                    <span class="activity-amount positive">R$4.000,00</span>
                </li>
                <li>
                    <span class="activity-icon">&#128722;</span> <div class="activity-details">
                        <h3>Mercado</h3>
                        <p>17:00 – Abril 24</p>
                    </div>
                    <span class="activity-amount negative">-R$100,00</span>
                </li>
                <li>
                    <span class="activity-icon">&#127968;</span> <div class="activity-details">
                        <h3>Aluguel</h3>
                        <p>8:30 – Abril 21</p>
                    </div>
                    <span class="activity-amount negative">-R$874,40</span>
                </li>
            `;
        }

    } catch (error) {
        console.error('Erro ao carregar dados da Home:', error);
        // Exibir "N/A" ou 0.00 se houver erro
        if (userNameElement) userNameElement.textContent = 'Olá Usuário,';
        if (totalBalanceElement) totalBalanceElement.textContent = 'R$0,00';
        if (totalExpensesElement) totalExpensesElement.textContent = 'R$0,00';
        if (sharedExpensesValueElement) sharedExpensesValueElement.textContent = 'R$0,00';
        if (progressBarFill) progressBarFill.style.width = '0%';
        if (progressText) progressText.textContent = 'Erro ao carregar dados.';
    }
}

// Lógica para carregar dados da tela Despesas (Wallet Details)
async function loadDespesasPageData() {
    // Para simplificar, estamos usando um walletId mockado do seeder do backend.
    // Em um app real, o usuário selecionaria uma carteira ou haveria uma carteira padrão.
    const MOCK_WALLET_ID = 'b6f6e5e0-1c0c-4c9f-8e3b-9a2c1d0e4f5a'; // ID de uma carteira do seeder

    const paidAmountElement = document.getElementById('paidAmount'); // ID do "Pago"
    const totalAmountElement = document.getElementById('totalAmount'); // ID do "Total"
    const progressPaidBar = document.getElementById('progressPaidBar'); // ID da barra de progresso "Pago"
    const progressBarMain = document.getElementById('progressBarMain'); // ID da barra de progresso principal

    try {
        const walletDetails = await fetchData(`${BASE_URL}/wallets/${MOCK_WALLET_ID}`);
        if (paidAmountElement) paidAmountElement.innerHTML = `Pago<br>R$${walletDetails.paidAmount.toFixed(2).replace('.', ',')}`;
        if (totalAmountElement) totalAmountElement.innerHTML = `Total<br>-R$${Math.abs(walletDetails.totalAmount).toFixed(2).replace('.', ',')}`;

        // Atualizar barras de progresso
        if (walletDetails.totalAmount !== 0) {
            const percentage = (walletDetails.paidAmount / Math.abs(walletDetails.totalAmount)) * 100;
            if (progressPaidBar) progressPaidBar.style.width = `${Math.min(percentage, 100)}%`;
            if (progressBarMain) progressBarMain.style.width = `${Math.min(percentage, 100)}%`; // Assumindo que esta também é a barra do Pago
        } else {
            if (progressPaidBar) progressPaidBar.style.width = '0%';
            if (progressBarMain) progressBarMain.style.width = '0%';
        }

    } catch (error) {
        console.error('Erro ao carregar detalhes da carteira:', error);
        if (paidAmountElement) paidAmountElement.innerHTML = 'Pago<br>R$0,00';
        if (totalAmountElement) totalAmountElement.innerHTML = 'Total<br>-R$0,00';
        if (progressPaidBar) progressPaidBar.style.width = '0%';
        if (progressBarMain) progressBarMain.style.width = '0%';
    }
}


// Lógica para carregar dados da tela Comida (Expenses by Category)
async function loadComidaPageData() {
    const MOCK_WALLET_ID = 'b6f6e5e0-1c0c-4c9f-8e3b-9a2c1d0e4f5a';
    const categoryName = 'Comida'; // Esta tela é específica para 'Comida'

    const paidAmountElement = document.getElementById('comidaPaidAmount');
    const totalAmountElement = document.getElementById('comidaTotalAmount');
    const progressBarPaidFill = document.getElementById('comidaProgressBarPaidFill'); // ID da barra de progresso "Pago"
    const progressBarMainFill = document.getElementById('comidaProgressBarMainFill'); // ID da barra de progresso principal
    const expenseListSection = document.getElementById('comidaExpenseListSection'); // Adicionar ID à seção <section class="lista">

    try {
        const categoryData = await fetchData(`${BASE_URL}/expenses/${MOCK_WALLET_ID}/category/${categoryName}`);

        if (paidAmountElement) paidAmountElement.innerHTML = `Pago<br>R$${categoryData.paidAmount.toFixed(2).replace('.', ',')}`;
        if (totalAmountElement) totalAmountElement.innerHTML = `Total<br>-R$${Math.abs(categoryData.totalAmount).toFixed(2).replace('.', ',')}`;

        if (categoryData.totalAmount !== 0) {
            const percentage = (categoryData.paidAmount / Math.abs(categoryData.totalAmount)) * 100;
            if (progressBarPaidFill) progressBarPaidFill.style.width = `${Math.min(percentage, 100)}%`;
            if (progressBarMainFill) progressBarMainFill.style.width = `${Math.min(percentage, 100)}%`;
        } else {
            if (progressBarPaidFill) progressBarPaidFill.style.width = '0%';
            if (progressBarMainFill) progressBarMainFill.style.width = '0%';
        }

        if (expenseListSection) {
            expenseListSection.innerHTML = ''; // Limpa o conteúdo existente

            categoryData.monthlyExpenses.forEach(monthData => {
                // Título do Mês
                const monthDiv = document.createElement('div');
                monthDiv.className = 'mes';
                monthDiv.innerHTML = `${monthData.month} <span class="icon calendar">&#128197;</span>`;
                expenseListSection.appendChild(monthDiv);

                // Lista de despesas do mês
                const ul = document.createElement('ul');
                monthData.expenses.forEach(expense => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span class="icone">${getCategoryEmoji(expense.category)}</span>
                        <div>
                            <h3>${expense.description}</h3>
                            <p>${new Date(expense.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })} – ${new Date(expense.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <span class="preco">R$${Math.abs(expense.amount).toFixed(2).replace('.', ',')}</span>
                    `;
                    ul.appendChild(li);
                });
                expenseListSection.appendChild(ul);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar dados da categoria Comida:', error);
        if (paidAmountElement) paidAmountElement.innerHTML = 'Pago<br>R$0,00';
        if (totalAmountElement) totalAmountElement.innerHTML = 'Total<br>-R$0,00';
        if (progressBarPaidFill) progressBarPaidFill.style.width = '0%';
        if (progressBarMainFill) progressBarMainFill.style.width = '0%';
        if (expenseListSection) expenseListSection.innerHTML = '<p style="color:white; text-align:center;">Não foi possível carregar as despesas desta categoria.</p>';
    }
}

// Helper para obter o emoji da categoria (mantido no frontend para display)
function getCategoryEmoji(category) {
    const iconMap = {
        'Comida': '🍽️',
        'Transporte': '🚗',
        'Casa': '🏠',
        'Mercado': '🛒',
        'Aluguel': '🏡',
        'Presentes': '🎁',
        'Outros': '📦',
        'Entretenimento': '🎬',
    };
    return iconMap[category] || '💰';
}


// Lógica para carregar dados da tela Novo (Adicionar Despesa)
async function handleNovoExpenseForm(event) {
    event.preventDefault();

    const description = document.getElementById('expense-name').value;
    const value = document.getElementById('expense-value').value;
    const category = document.getElementById('expense-category').value; // Usar o ID correto

    const userId = localStorage.getItem('splitBankUserId');
    if (!userId) {
        alert('Você precisa estar logado para adicionar despesas.');
        irParaLogin();
        return;
    }

    const MOCK_WALLET_ID = 'b6f6e5e0-1c0c-4c9f-8e3b-9a2c1d0e4f5a'; // Usar o ID de uma carteira existente

    try {
        const response = await fetchData(`${BASE_URL}/expenses/${MOCK_WALLET_ID}`, 'POST', {
            description: description,
            value: parseFloat(value), // Garantir que o valor é um número
            category: category,
            paidById: userId
        });
        console.log('Despesa adicionada:', response);
        alert(`Despesa "${description}" de R$${parseFloat(value).toFixed(2).replace('.', ',')} adicionada!`);
        // Fechar o pop-up ou redirecionar
        if (window.parent && window.parent.postMessage) {
            window.parent.postMessage({ type: 'newExpense', data: response.expenseDetails }, window.location.origin);
        } else {
            // Se não estiver em um iframe, redireciona
            window.location.href = 'despesas.html';
        }
    } catch (error) {
        console.error('Erro ao adicionar despesa:', error);
        alert('Falha ao adicionar despesa. Verifique os dados e tente novamente.');
    }
}

// Lógica para carregar dados da tela Equipe
async function loadEquipePageData() {
    const MOCK_WALLET_ID = 'b6f6e5e0-1c0c-4c9f-8e3b-9a2c1d0e4f5a';

    const totalParticipantsElement = document.getElementById('totalParticipants'); // Adicionar ID
    const totalPaidElement = document.getElementById('totalPaidAmount'); // Adicionar ID
    const totalSpentElement = document.getElementById('totalSpentAmount'); // Adicionar ID
    const teamExpensesListSection = document.getElementById('teamExpensesListSection'); // Adicionar ID à seção <ul>

    try {
        const teamData = await fetchData(`${BASE_URL}/team/${MOCK_WALLET_ID}/summary`);

        if (totalParticipantsElement) totalParticipantsElement.textContent = teamData.totalParticipants;
        if (totalPaidElement) totalPaidElement.textContent = `R$${teamData.totalPaid.toFixed(2).replace('.', ',')}`;
        if (totalSpentElement) totalSpentElement.textContent = `R$${teamData.totalSpent.toFixed(2).replace('.', ',')}`;

        if (teamExpensesListSection) {
            teamExpensesListSection.innerHTML = ''; // Limpa o conteúdo existente

            // Agrupar por mês, similar à tela de comida
            const monthlyParticipants = teamData.participantExpenses.reduce((acc, expense) => {
                const date = new Date(expense.date);
                const month = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
                const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1);

                if (!acc[monthCapitalized]) {
                    acc[monthCapitalized] = [];
                }
                acc[monthCapitalized].push({
                    name: expense.name,
                    amount: expense.amount,
                    date: expense.date,
                    category: expense.category || ''
                });
                return acc;
            }, {});

            Object.keys(monthlyParticipants).forEach(month => {
                const monthHeader = document.createElement('div');
                monthHeader.className = 'mes-header';
                monthHeader.innerHTML = `${month} <span class="icon-calendar">&#128197;</span>`;
                teamExpensesListSection.appendChild(monthHeader);

                const ul = document.createElement('ul');
                monthlyParticipants[month].forEach(participant => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span class="item-icon">&#128100;</span>
                        <div class="item-details">
                            <h3>${participant.name}</h3>
                            <p>${new Date(participant.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })} – ${new Date(participant.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                            ${participant.category ? `<span class="item-description">${participant.category}</span>` : ''}
                        </div>
                        <span class="item-value">R$${Math.abs(participant.amount).toFixed(2).replace('.', ',')}</span>
                    `;
                    ul.appendChild(li);
                });
                teamExpensesListSection.appendChild(ul);
            });
        }

    } catch (error) {
        console.error('Erro ao carregar dados da Equipe:', error);
        if (totalParticipantsElement) totalParticipantsElement.textContent = 'N/A';
        if (totalPaidElement) totalPaidElement.textContent = 'R$0,00';
        if (totalSpentElement) totalSpentElement.textContent = 'R$0,00';
        if (teamExpensesListSection) teamExpensesListSection.innerHTML = '<p style="color:white; text-align:center;">Não foi possível carregar os dados da equipe.</p>';
    }
}


// --- Event Listeners globais (para todas as páginas que usam script.js) ---
document.addEventListener('DOMContentLoaded', () => {
    // Event listeners para a página index.html
    const btnEntrarIndex = document.querySelector('.btn-white');
    if (btnEntrarIndex) {
        btnEntrarIndex.addEventListener('click', irParaLogin);
    }
    const btnCadastroIndex = document.querySelector('.btn-pink');
    if (btnCadastroIndex) {
        btnCadastroIndex.addEventListener('click', irParaCadastro);
    }

    // Event listeners para a página login.html
    const loginForm = document.querySelector('.login-form'); // Seleciona o formulário de login
    if (loginForm && window.location.pathname.endsWith('login.html')) {
        loginForm.addEventListener('submit', handleLogin); // Adiciona o evento submit ao formulário
        // Ajusta o botão "Entrar" para ser do tipo submit e não ter onclick direto
        const btnEntrar = loginForm.querySelector('.btn-entrar');
        if (btnEntrar) {
            btnEntrar.type = 'submit';
            btnEntrar.removeAttribute('onclick'); // Remove o onclick direto
        }
        // Ajusta o botão "Cadastrar" no login
        const btnCadastrarLogin = loginForm.querySelector('.btn-cadastrar');
        if (btnCadastrarLogin) {
            btnCadastrarLogin.addEventListener('click', irParaCadastro);
            btnCadastrarLogin.type = 'button'; // Garante que não é submit
        }
        // Ajusta a funcionalidade do toggle de senha
        const toggleSpan = loginForm.querySelector('.toggle');
        if (toggleSpan) {
            toggleSpan.addEventListener('click', () => toggleSenha('senha'));
        }
    }


    // Event listeners para a página cadastro.html
    const cadastroForm = document.querySelector('.Cadastro-page .login-form'); // Seleciona o formulário de cadastro
    if (cadastroForm && window.location.pathname.endsWith('cadastro.html')) {
        cadastroForm.addEventListener('submit', handleRegister); // Adiciona o evento submit
        // Ajusta o link "Já tem uma conta? Entrar"
        const goToLoginLink = cadastroForm.querySelector('.link');
        if (goToLoginLink) {
            goToLoginLink.addEventListener('click', irParaLogin);
        }
        // Ajusta a funcionalidade dos toggles de senha
        const senhaToggle = cadastroForm.querySelector('#senha + .toggle');
        if (senhaToggle) {
            senhaToggle.addEventListener('click', () => toggleSenha('senha'));
        }
        const confirmaToggle = cadastroForm.querySelector('#confirma + .toggle');
        if (confirmaToggle) {
            confirmaToggle.addEventListener('click', () => toggleSenha('confirma'));
        }
    }


    // Event listeners para a página home.html
    if (window.location.pathname.endsWith('home.html')) {
        loadHomePageData(); // Carrega os dados da Home
        // Navegação da barra inferior
        const homeNav = document.querySelector('.footer-nav .nav-item-link[href="home.html"]');
        if (homeNav) homeNav.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'home.html'; });

        const despesasLink = document.querySelector('.info-card .full-card-link[href="despesas.html"]');
        if (despesasLink) despesasLink.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'despesas.html'; });

        const equipeNav = document.querySelector('.footer-nav .nav-item-link[href="equipe.html"]');
        if (equipeNav) equipeNav.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'equipe.html'; });
    }

    // Event listeners para a página despesas.html
    if (window.location.pathname.endsWith('despesas.html')) {
        loadDespesasPageData(); // Carrega os dados da página Despesas

        const comidaLink = document.querySelector('.grid .btn-grid-link[href="comida.html"]');
        if (comidaLink) comidaLink.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'comida.html'; });

        const novoLink = document.querySelector('.grid .btn-grid-link[href="novo.html"]');
        if (novoLink) novoLink.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'novo.html'; });

        // Navegação da barra inferior
        const homeNav = document.querySelector('.footer-nav .nav-item-link[href="home.html"]');
        if (homeNav) homeNav.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'home.html'; });

        const equipeNav = document.querySelector('.footer-nav .nav-item-link[href="equipe.html"]');
        if (equipeNav) equipeNav.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'equipe.html'; });
    }

    // Event listeners para a página comida.html
    if (window.location.pathname.endsWith('comida.html')) {
        loadComidaPageData(); // Carrega os dados da página Comida
    }

    // Event listeners para a página novo.html (pop-up de adicionar despesa)
    if (window.location.pathname.endsWith('novo.html')) {
        const saveExpenseButton = document.getElementById('save-expense'); // O botão "Adicionar" no formulário novo.html
        if (saveExpenseButton) {
            saveExpenseButton.addEventListener('click', handleNovoExpenseForm);
        }

        const cancelExpenseButton = document.getElementById('cancel-expense'); // O botão "Cancelar"
        if (cancelExpenseButton) {
             cancelExpenseButton.addEventListener('click', () => {
                if (window.parent && window.parent.postMessage) {
                    window.parent.postMessage('closePopup', window.location.origin);
                } else {
                    window.history.back(); // Fallback se não estiver em iframe
                }
            });
        }
    }

    // Event listeners para a página equipe.html
    if (window.location.pathname.endsWith('equipe.html')) {
        loadEquipePageData(); // Carrega os dados da página Equipe
        // Navegação da barra inferior
        const homeNav = document.querySelector('.bottom-nav .nav-item[href="home.html"]');
        if (homeNav) homeNav.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'home.html'; });
        const equipeNav = document.querySelector('.bottom-nav .nav-item[href="equipe.html"]');
        if (equipeNav) equipeNav.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'equipe.html'; });
    }

    // Lógica antiga do pop-up do script.js (revisada para não usar alert() e integrar melhor)
    // OBS: O pop-up do novo.html deve ser um HTML separado e enviar dados via postMessage
    // Removi a lógica do pop-up modal que estava no script.js original
    // pois a abordagem agora é carregar novo.html em um iframe ou usar navegação direta.

    // A lógica original que abria um modal em despesas.html para adicionar despesas não é mais necessária
    // Se o btn-novo redireciona para novo.html, e novo.html tem seu próprio formulário.
    // document.querySelector(".btn-grid:last-child").addEventListener("click", function () {
    //   document.getElementById("expense-modal").style.display = "flex";
    // });
    // document.querySelector(".close").addEventListener("click", function () {
    //   document.getElementById("expense-modal").style.display = "none";
    // });
    // document.getElementById("save-expense").addEventListener("click", function () { ... });
    // Estes blocos foram substituídos por handleNovoExpenseForm e a navegação direta/iframe.

    // Event listener para o pop-up, se você ainda usar o pop-up por iframe
    const popupOverlay = document.getElementById('popup-overlay');
    const popupFrame = document.getElementById('popup-frame');

    if (popupOverlay && popupFrame) {
        window.addEventListener('message', (event) => {
            if (event.origin === window.location.origin) {
                if (event.data === 'closePopup') {
                    popupOverlay.style.display = 'none';
                    popupFrame.src = '';
                } else if (event.data && event.data.type === 'newExpense') {
                    console.log('Nova despesa adicionada (via pop-up):', event.data.data);
                    alert(`Despesa adicionada: ${event.data.data.description} - R$${event.data.data.amount.toFixed(2).replace('.', ',')} (${event.data.data.category})`);
                    popupOverlay.style.display = 'none';
                    popupFrame.src = '';
                    // Recarregar dados da página atual se for relevante (ex: despesas.html)
                    if (window.location.pathname.endsWith('despesas.html')) {
                        loadDespesasPageData();
                    }
                }
            }
        });

        popupOverlay.addEventListener('click', (event) => {
            if (event.target === popupOverlay) {
                popupOverlay.style.display = 'none';
                popupFrame.src = '';
            }
        });
    }

});