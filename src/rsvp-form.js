import { supabase } from './supabase.js';
import { showConfirmation } from './confirmation.js';

function showError(status, submitBtn, msg) {
  status.textContent = '';
  status.className = 'form-status form-status--error';
  status.appendChild(document.createTextNode(
    'Something went wrong. Please screenshot this and send it to Kev.'
  ));
  const details = document.createElement('details');
  details.className = 'error-details';
  details.open = true;
  const summary = document.createElement('summary');
  summary.textContent = 'Error details';
  details.appendChild(summary);
  const code = document.createElement('code');
  code.textContent = msg;
  details.appendChild(code);
  status.appendChild(details);
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send RSVP';
  }
}

export function initForm() {
  // Phone mask
  document.getElementById('phone')?.addEventListener('input', function () {
    const d = this.value.replace(/\D/g, '').slice(0, 10);
    if (d.length === 0) { this.value = ''; return; }
    if (d.length <= 3) { this.value = '(' + d; }
    else if (d.length <= 6) { this.value = '(' + d.slice(0, 3) + ') ' + d.slice(3); }
    else { this.value = '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6); }
  });

  // Guest stepper
  document.querySelectorAll('.stepper-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input[type="number"]');
      const step = btn.classList.contains('stepper-increment') ? 1 : -1;
      input.value = Math.max(
        parseInt(input.min, 10) || 0,
        Math.min(parseInt(input.max, 10) || 99, (parseInt(input.value, 10) || 0) + step)
      );
    });
  });

  // Reveal notes after RSVP selected
  document.querySelectorAll('input[name="rsvp"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const notesReveal = document.getElementById('notes-reveal');
      if (notesReveal) notesReveal.hidden = false;
    });
  });

  // Form submit
  document.getElementById('rsvp-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const status = document.getElementById('form-status');
    const submitBtn = form.querySelector('.submit-btn');

    if (form.website?.value) return; // honeypot

    status.textContent = '';
    status.className = 'form-status';

    const rawPhone = form.phone.value.trim();
    let digits = rawPhone.replace(/\D/g, '');
    if (digits.length === 11 && digits[0] === '1') digits = digits.slice(1);
    if (digits.length !== 10) {
      status.textContent = 'Please enter a valid 10-digit phone number.';
      status.className = 'form-status form-status--error';
      form.phone.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const rsvpName = form.name.value.trim();
    const rsvpPhone = form.phone.value.trim();
    const rsvpResponse = form.rsvp.value;
    const rsvpGuests = parseInt(form.additional_guests.value, 10) || 0;
    const rsvpNotes = form.notes?.value.trim() || '';

    const { error } = await supabase.from('rsvps').insert({
      name: rsvpName,
      phone: rsvpPhone,
      rsvp: rsvpResponse,
      additional_guests: rsvpGuests,
      notes: rsvpNotes || null,
    });

    if (error) {
      if (error.code === '23505') {
        status.textContent = 'Looks like you already submitted an RSVP with this phone number.';
        status.className = 'form-status form-status--error';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send RSVP';
      } else {
        showError(status, submitBtn, error.message || JSON.stringify(error));
      }
    } else {
      try {
        sessionStorage.setItem('rsvp', JSON.stringify({
          name: rsvpName, rsvp: rsvpResponse, guests: rsvpGuests, notes: rsvpNotes,
        }));
      } catch (e) {}
      const section = document.querySelector('.rsvp-section');
      showConfirmation(section, rsvpName, rsvpPhone, rsvpResponse, rsvpGuests, rsvpNotes);
    }
  });
}
