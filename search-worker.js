let DATA = null;
let vocabSet = null;
let maxWordLen = 0;

self.onmessage = function(e) {
  const { type, payload } = e.data;

  if (type === 'init') {
    DATA = payload;
    vocabSet = new Set(DATA.vocab);
    maxWordLen = DATA.maxWordLen;
    self.postMessage({ type: 'ready' });
    return;
  }

  if (type === 'search') {
    const results = search(payload.query, payload.filterArtist, payload.filterEmotion, payload.filterYear);
    self.postMessage({ type: 'results', payload: results, query: payload.query });
  }
};

function tokenizeQuery(text) {
  if (!vocabSet) return [];
  const cleaned = text.replace(/[^฀-๿a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const segments = cleaned.split(/\s+/).filter(s => s.length > 0);
  const tokens = [];
  for (const seg of segments) {
    let i = 0;
    while (i < seg.length) {
      let found = false;
      for (let len = Math.min(maxWordLen, seg.length - i); len >= 2; len--) {
        const candidate = seg.substring(i, i + len);
        if (vocabSet.has(candidate)) {
          tokens.push(candidate);
          i += len;
          found = true;
          break;
        }
      }
      if (!found) i++;
    }
  }
  return tokens;
}

function queryToVector(tokens) {
  const tf = {};
  let maxTf = 0;
  for (const t of tokens) {
    tf[t] = (tf[t] || 0) + 1;
    if (tf[t] > maxTf) maxTf = tf[t];
  }
  if (maxTf === 0) return {};
  const vec = {};
  for (const [word, count] of Object.entries(tf)) {
    const idx = DATA.vocab.indexOf(word);
    if (idx >= 0) {
      vec[String(idx)] = (count / maxTf) * DATA.idf[idx];
    }
  }
  return vec;
}

function cosineSim(vecA, vecB) {
  let dot = 0, magA = 0, magB = 0;
  for (const [k, v] of Object.entries(vecA)) {
    magA += v * v;
    if (vecB[k] !== undefined) dot += v * vecB[k];
  }
  for (const v of Object.values(vecB)) magB += v * v;
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function search(query, filterArtist, filterEmotion, filterYear) {
  if (!DATA || !query.trim()) return [];

  const q = query.trim().toLowerCase();
  const tokens = tokenizeQuery(query.trim());
  const qVec = queryToVector(tokens);
  const hasVector = Object.keys(qVec).length > 0;

  const results = [];
  for (let i = 0; i < DATA.songs.length; i++) {
    const song = DATA.songs[i];

    if (filterArtist && song.artist !== filterArtist) continue;
    if (filterEmotion && song.emotion !== filterEmotion) continue;
    if (filterYear && song.year !== filterYear) continue;

    const lyrics = song.lyrics.toLowerCase();
    let score = 0;

    const exactMatch = lyrics.includes(q);
    if (exactMatch) score += 0.3;

    if (tokens.length > 0) {
      let matched = 0;
      for (const t of tokens) {
        if (lyrics.includes(t)) matched++;
      }
      score += 0.2 * (matched / tokens.length);
    }

    if (hasVector) {
      const cos = cosineSim(qVec, DATA.vectors[i]);
      score += 0.5 * cos;
    }

    if (score > 0.01) {
      results.push({ idx: i, score, exactMatch });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 50);
}
