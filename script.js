(() => {
    const taxRate = 0.18; // 18%
    const $ = id => document.getElementById(id);
    const format = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    let cart = [];

    const elements = {
        name: $('product-name'),
        price: $('product-price'),
        qty: $('product-qty'),
        addBtn: $('add-product'),
        clearBtn: $('clear-products'),
        cartTableBody: document.querySelector('#cart-table tbody'),
        subtotalEl: $('subtotal'),
        taxEl: $('tax'),
        totalEl: $('total'),
        paidAmount: $('paid-amount'),
        finalizeBtn: $('finalize'),
        changeEl: $('change'),
        receiptEl: $('receipt')
    };

    function recalc() {
        const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
        const tax = subtotal * taxRate;
        const total = subtotal + tax;
        elements.subtotalEl.textContent = format(subtotal);
        elements.taxEl.textContent = format(tax);
        elements.totalEl.textContent = format(total);
        return { subtotal, tax, total };
    }

    function renderCart() {
        elements.cartTableBody.innerHTML = '';
        cart.forEach((item, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${escapeHtml(item.name)}</td>
        <td>${format(item.price)}</td>
        <td>${item.qty}</td>
        <td>${format(item.price * item.qty)}</td>
        <td><button data-idx="${idx}" class="remove">Remover</button></td>
      `;
            elements.cartTableBody.appendChild(tr);
        });
        document.querySelectorAll('button.remove').forEach(btn => {
            btn.addEventListener('click', e => {
                const i = +e.currentTarget.dataset.idx;
                cart.splice(i, 1);
                renderCart();
                recalc();
            });
        });
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, function(m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; });
    }

    elements.addBtn.addEventListener('click', () => {
        const name = elements.name.value.trim() || 'Produto';
        const price = Number(elements.price.value) || 0;
        const qty = Math.max(1, Math.floor(Number(elements.qty.value) || 1));
        if (price <= 0) {
            alert('Informe um preço maior que zero.');
            return;
        }
        cart.push({ name, price, qty });
        elements.name.value = '';
        elements.price.value = '';
        elements.qty.value = '1';
        renderCart();
        recalc();
    });

    elements.clearBtn.addEventListener('click', () => {
        if (!confirm('Deseja limpar todos os itens do carrinho?')) return;
        cart = [];
        renderCart();
        recalc();
        elements.receiptEl.textContent = '';
        elements.changeEl.textContent = '';
    });

    elements.finalizeBtn.addEventListener('click', () => {
        const { subtotal, tax, total } = recalc();
        const paid = Number(elements.paidAmount.value) || 0;
        if (cart.length === 0) {
            alert('Adicione pelo menos um item antes de finalizar.');
            return;
        }
        if (paid < total) {
            alert('Valor pago insuficiente. Informe um valor maior ou igual ao total.');
            return;
        }
        const change = paid - total;
        elements.changeEl.textContent = 'Troco: ' + format(change);

        const now = new Date();
        let receipt = '';
        receipt += '--- RECEBIMENTO ---\n';
        receipt += 'Data: ' + now.toLocaleString('pt-BR') + '\n';
        receipt += '-------------------\n';
        cart.forEach(it => {
            receipt += `${it.name} x${it.qty} @ ${format(it.price)} = ${format(it.price*it.qty)}\n`;
        });
        receipt += '-------------------\n';
        receipt += `Subtotal: ${format(subtotal)}\n`;
        receipt += `Impostos(18%): ${format(tax)}\n`;
        receipt += `TOTAL: ${format(total)}\n`;
        receipt += `Pago: ${format(paid)}\n`;
        receipt += `Troco: ${format(change)}\n`;
        receipt += '-------------------\n';
        receipt += 'Arigato!\n';
        elements.receiptEl.textContent = receipt;

        cart = [];
        renderCart();
        recalc();
        elements.paidAmount.value = '';
    });

    renderCart();
    recalc();
})();