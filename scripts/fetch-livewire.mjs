import https from 'https';

const url = 'https://www.hkengage.gov.hk/zh-HK/how-to-apply-for-a-visa';

https.get(url, (res) => {
  const chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    let html = Buffer.concat(chunks).toString('utf8');
    const csrfMatch = html.match(/<meta[^>]+name="csrf-token"[^>]+content="([^"]+)"/);
    const csrfToken = csrfMatch ? csrfMatch[1] : null;

    // Find visa-application component ID
    const snapshotRegex = /wire:id="([^"]+)"[^>]*wire:snapshot="([^"]+)"/g;
    let snapMatch;
    let componentId = null;
    while ((snapMatch = snapshotRegex.exec(html)) !== null) {
      try {
        const raw = snapMatch[2].replace(/&quot;/g, '"');
        const decoded = decodeURIComponent(raw);
        const data = JSON.parse(decoded);
        if (data.data && data.data.suitable_schemes) {
          componentId = snapMatch[1];
          break;
        }
      } catch (e) {}
    }

    if (!componentId || !csrfToken) {
      console.log('Missing data:', componentId, csrfToken);
      return;
    }

    console.log('Component ID:', componentId);

    // Make Livewire 3 update request
    const updates = {
      fingerprint: {
        id: componentId,
        name: 'visa-application',
        locale: 'zh-HK',
        path: 'zh-HK/how-to-apply-for-a-visa',
        method: 'GET',
      },
      updates: {
        'entangle': {
          path: '',
          value: 'mainland',
        },
      },
      snapshot: {
        data: {
          allow_reset: true,
          previous_step: null,
          answers_list: {},
          question_no: '',
          selected_choice: '',
          last_question: false,
          suitable_schemes: { '1': true, '2': true, '3': true, '4': true, '5': true, '6': true, '7': true },
          total_suitable_schemes: 7,
          visa_application: {},
          questions_list: {},
          schemes_list: {},
          scheme_index: {},
          current_question_set: {},
          miscellaneous: {},
          matching_tool: {},
          opened: false,
          standalone: false,
        },
      },
    };

    const payload = JSON.stringify(updates);
    const options = {
      hostname: 'www.hkengage.gov.hk',
      path: '/zh-HK/livewire/update',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'X-CSRF-TOKEN': csrfToken,
        'X-Livewire': 'true',
        'Referer': url,
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
    };

    const req = https.request(options, (response) => {
      const resChunks = [];
      response.on('data', (chunk) => resChunks.push(chunk));
      response.on('end', () => {
        const resBody = Buffer.concat(resChunks).toString('utf8');
        console.log('Response status:', response.statusCode);
        console.log('Response body (first 500 chars):', resBody.substring(0, 500));
      });
    });

    req.on('error', (e) => console.error('Error:', e.message));
    req.write(payload);
    req.end();
  });
}).on('error', (e) => {
  console.error('Fetch error:', e.message);
});
