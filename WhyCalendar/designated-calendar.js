(function () {
  'use strict';

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  const weekdayRow = ['日', '一', '二', '三', '四', '五', '六'];

  const REST_DATES = new Set([
    '2026-04-04', '2026-04-05', '2026-04-06'   // 清明
  ]);

  // ── DOM refs ────────────────────────────────────────────────
  const $ = function (id) { return document.getElementById(id); };
  const startInput    = $('rangeStart');
  const endInput      = $('rangeEnd');
  const btnRender     = $('btnRender');
  const btnDownload   = $('btnDownload');
  const exportRoot    = $('exportRoot');
  const statusEl      = $('statusMsg');

  // toggle refs
  const darkModeToggle   = $('optDarkMode');
  const hideOotToggle    = $('optHideOot');
  const monthDividerToggle = $('optMonthDivider');
  const todayHighlightToggle = $('optToday');
  const roundedCornerToggle  = $('optRoundedCorner');

  // font refs
  const fontEnSelect = $('fontEn');
  const fontCnSelect = $('fontCn');
  const resolutionSelect = $('optResolution');

  // 导出分辨率映射：label → html2canvas scale
  const RESOLUTION_SCALES = {
    '720p':  2,
    '1080p': 3,
    '2K':    4,
    '4K':    6,
    '8K':    11
  };
  const DEFAULT_RESOLUTION = '4K';

  const EN_FONT_STACKS = {
    system: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    'Arial': 'Arial, Helvetica, sans-serif',
    'Helvetica': 'Helvetica, Arial, sans-serif',
    'Segoe UI': '"Segoe UI", Tahoma, Arial, sans-serif',
    'Tahoma': 'Tahoma, "Segoe UI", Arial, sans-serif',
    'Verdana': 'Verdana, Geneva, sans-serif',
    'Trebuchet MS': '"Trebuchet MS", "Segoe UI", Arial, sans-serif',
    'Georgia': 'Georgia, "Times New Roman", serif',
    'Times New Roman': '"Times New Roman", Times, serif',
    'Cambria': 'Cambria, Georgia, serif',
    'Garamond': 'Garamond, Georgia, serif',
    'Courier New': '"Courier New", Courier, monospace',
    'Consolas': 'Consolas, "Courier New", monospace',
    'Impact': 'Impact, "Arial Black", sans-serif'
  };

  const CN_FONT_STACKS = {
    system: 'system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", "DengXian", sans-serif',
    'Microsoft YaHei': '"Microsoft YaHei", "DengXian", "PingFang SC", sans-serif',
    'DengXian': '"DengXian", "Microsoft YaHei", "PingFang SC", sans-serif',
    'PingFang SC': '"PingFang SC", "Microsoft YaHei", "DengXian", sans-serif',
    'Heiti SC': '"Heiti SC", "Microsoft YaHei", sans-serif',
    'STHeiti': '"STHeiti", "Microsoft YaHei", sans-serif',
    'SimHei': '"SimHei", "Microsoft YaHei", sans-serif',
    'SimSun': '"SimSun", serif',
    'Noto Sans SC': '"Noto Sans SC", "Microsoft YaHei", sans-serif',
    'FangSong': '"FangSong", serif',
    'KaiTi': '"KaiTi", serif'
  };

  // ── Utilities ──────────────────────────────────────────────
  function toDateKey(d) {
    const y   = d.getFullYear();
    const mo  = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + mo + '-' + day;
  }

  function parseDate(value) {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    return (isNaN(y) || isNaN(m) || isNaN(d)) ? null : new Date(y, m - 1, d);
  }

  /** 农历库 Solar.fromYmd(y,m,d).getLunar() */
  function lunarLabel(y, m, d) {
    if (typeof Solar === 'undefined') return '';
    try {
      return Solar.fromYmd(y, m, d).getLunar().getDayInChinese();
    } catch (_) { return ''; }
  }

  function isRestDay(y, m, d) {
    return REST_DATES.has(toDateKey(new Date(y, m - 1, d)));
  }

  function isToday(y, m, d) {
    const t = new Date();
    return t.getFullYear() === y && t.getMonth() + 1 === m && t.getDate() === d;
  }

  function mk(tag, cls, txt) {
    const el = document.createElement(tag || 'div');
    if (cls) el.className = cls;
    if (txt !== undefined) el.textContent = txt;
    return el;
  }

  function resolveEnFontStack(name) {
    return EN_FONT_STACKS[name] || EN_FONT_STACKS[DEFAULTS.fontEn];
  }

  function resolveCnFontStack(name) {
    return CN_FONT_STACKS[name] || CN_FONT_STACKS[DEFAULTS.fontCn];
  }

  function setSelectValueSafe(selectEl, value, fallback) {
    if (!selectEl) return;
    var v = value || fallback;
    var has = Array.prototype.some.call(selectEl.options, function (opt) { return opt.value === v; });
    selectEl.value = has ? v : fallback;
  }

  // ── Options snapshot ───────────────────────────────────────
  function getOpts() {
    return {
      darkMode:      darkModeToggle.checked,
      hideOot:       hideOotToggle.checked,
      monthDivider:  monthDividerToggle.checked,
      todayHighlight: todayHighlightToggle.checked,
      roundedCorner:  roundedCornerToggle.checked,
      fontEn:        fontEnSelect.value,
      fontCn:        fontCnSelect.value,
      resolution:    resolutionSelect.value || DEFAULT_RESOLUTION
    };
  }

  // ── Calendar rendering ─────────────────────────────────────
  function renderCalendar(startDate, endDate, options) {
    options = options || {};
    const opts = getOpts();
    const rs   = new Date(startDate); rs.setHours(0, 0, 0, 0);
    const re   = new Date(endDate);   re.setHours(0, 0, 0, 0);

    // Outer wrapper (receives dark/light class)
    const wrap = mk('div', 'ios-export ' + (opts.darkMode ? 'dark' : 'light'));
    wrap.classList.toggle('no-rounded', !opts.roundedCorner);
    wrap.style.fontFamily = resolveEnFontStack(opts.fontEn) + ', ' + resolveCnFontStack(opts.fontCn);
    exportRoot.innerHTML = '';
    exportRoot.appendChild(wrap);

    // ── Header ──────────────────────────────────────────────
    const hdr = mk('div', 'ios-header');

    // Left: year pill + big month title
    const leftCol = mk('div', 'ios-hdr-left');
    const yearPill = mk('div', 'ios-year-pill');
    yearPill.innerHTML =
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">' +
        '<path d="M15 18l-6-6 6-6"/>' +
      '</svg>' +
      '<span>' + startDate.getFullYear() + '年</span>';

    // 点击年份区域打开年份选择器
    yearPill.style.cursor = 'pointer';
    yearPill.addEventListener('click', function(e) {
      e.stopPropagation();
      openYearPicker(startDate, function(newYear) {
        adjustYear(startDate, endDate, newYear);
      });
    });

    leftCol.appendChild(yearPill);
    leftCol.appendChild(mk('h1', 'ios-month-title', monthNames[startDate.getMonth()]));
    hdr.appendChild(leftCol);

    // Right: Why logo — top-right floating badge
    const logo = mk('div', 'ios-logo');
    logo.textContent = 'Why';
    hdr.appendChild(logo);

    wrap.appendChild(hdr);

    // ── Weekday row ──────────────────────────────────────────
    const wkRow = mk('div', 'ios-weekdays');
    const wkPillWrap = mk('div', 'ios-weekday-pills');
    weekdayRow.forEach(function (t) { wkPillWrap.appendChild(mk('span', 'ios-weekday-pill', t)); });
    wkRow.appendChild(wkPillWrap);
    wrap.appendChild(wkRow);

    // ── Grid ────────────────────────────────────────────────
    const grid = mk('div', 'ios-grid');

    // Calendar bounds aligned to Sunday–Saturday
    const from = new Date(rs);
    from.setDate(from.getDate() - rs.getDay());
    const to = new Date(re);
    to.setDate(to.getDate() + (6 - re.getDay()));

    const monthsSeen   = new Set();
    const firstMonthKey = rs.getFullYear() + '-' + rs.getMonth();
    const todayKey      = toDateKey(new Date());

    function appendDayCell(weekRow, dayInWeek, forceHidden) {
      const inRange = dayInWeek >= rs && dayInWeek <= re;
      const cell = mk('div', 'ios-cell');

      // 隐藏计划外或手动拆行隐藏：保留格子占位，保证列对齐
      if (forceHidden || (!inRange && opts.hideOot)) {
        cell.classList.add('ios-cell-hidden-oot');
        cell.setAttribute('aria-hidden', 'true');
        cell.appendChild(mk('div', 'ios-cell-inner'));
        weekRow.appendChild(cell);
        return;
      }

      if (!inRange) {
        cell.classList.add('faded');
      }

      const y = dayInWeek.getFullYear();
      const mo = dayInWeek.getMonth();
      const d = dayInWeek.getDate();
      const inner = mk('div', 'ios-cell-inner');
      inner.appendChild(mk('span', 'ios-g', String(d)));
      inner.appendChild(mk('span', 'ios-l', lunarLabel(y, mo + 1, d)));

      const dateKey = toDateKey(dayInWeek);
      if (inRange && opts.todayHighlight && dateKey === todayKey) {
        cell.classList.add('today-circle');
      }

      cell.appendChild(inner);
      weekRow.appendChild(cell);
    }

    let cur = new Date(from);

    while (cur <= to) {
      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(cur);
        d.setDate(d.getDate() + i);
        weekDates.push(d);
      }

      let firstDayIndex = -1;
      for (let i = 0; i < 7; i++) {
        const probeDay = weekDates[i];
        if (probeDay > to) break;
        if (probeDay < rs || probeDay > re) continue;
        if (probeDay.getDate() === 1) {
          firstDayIndex = i;
          break;
        }
      }

      const firstDayInThisWeek = firstDayIndex >= 0 ? weekDates[firstDayIndex] : null;
      const hasMonthBreak = !!firstDayInThisWeek;
      const bannerMonthKey = hasMonthBreak
        ? (firstDayInThisWeek.getFullYear() + '-' + firstDayInThisWeek.getMonth())
        : '';
      const shouldShowBanner = hasMonthBreak &&
        bannerMonthKey !== firstMonthKey &&
        !monthsSeen.has(bannerMonthKey);

      // 开启「月份分割线」且 1号不在周首：拆成两行（29/30/31 一行，4月后再显示 1/2/3/4）
      if (shouldShowBanner && opts.monthDivider && firstDayIndex > 0) {
        const weekRowBefore = mk('div', 'ios-week');
        for (let i = 0; i < 7; i++) {
          appendDayCell(weekRowBefore, weekDates[i], i >= firstDayIndex);
        }
        grid.appendChild(weekRowBefore);

        monthsSeen.add(bannerMonthKey);
        grid.appendChild(mk('div', 'ios-month-divider'));
        const banner = mk('div', 'ios-month-banner banner-break-row');
        banner.style.setProperty('--month-col', firstDayIndex);
        banner.appendChild(mk('span', null, (firstDayInThisWeek.getMonth() + 1) + '月'));
        grid.appendChild(banner);

        const weekRowAfter = mk('div', 'ios-week');
        for (let i = 0; i < 7; i++) {
          appendDayCell(weekRowAfter, weekDates[i], i < firstDayIndex);
        }
        grid.appendChild(weekRowAfter);
      } else {
        if (shouldShowBanner) {
          monthsSeen.add(bannerMonthKey);
          if (opts.monthDivider) grid.appendChild(mk('div', 'ios-month-divider'));
          const bannerCls = opts.monthDivider ? 'ios-month-banner banner-break-row' : 'ios-month-banner';
          const banner = mk('div', bannerCls);
          banner.style.setProperty('--month-col', firstDayIndex);
          banner.appendChild(mk('span', null, (firstDayInThisWeek.getMonth() + 1) + '月'));
          grid.appendChild(banner);
        }

        const weekRow = mk('div', 'ios-week');
        for (let i = 0; i < 7; i++) {
          appendDayCell(weekRow, weekDates[i], false);
        }
        grid.appendChild(weekRow);
      }

      cur.setDate(cur.getDate() + 7);
    }

    wrap.appendChild(grid);
  }

  // ── Validation & render ────────────────────────────────────
  function validateAndRender() {
    statusEl.textContent = '';
    btnDownload.disabled = true;

    const start = parseDate(startInput.value);
    const end   = parseDate(endInput.value);

    if (!start || !end) {
      statusEl.textContent = '请选择开始与结束日期。';
      return;
    }
    if (end < start) {
      statusEl.textContent = '结束日期不能早于开始日期。';
      return;
    }
    const days = Math.round((end - start) / 86400000) + 1;
    if (days > 62) {
      statusEl.textContent = '区间最长 62 天，请缩小范围以保持图片清晰。';
      return;
    }

    renderCalendar(start, end);
    btnDownload.disabled = false;
  }

  // ── PNG CRC-32 ──────────────────────────────────────────────
  var _crcTable = null;
  function buildCrcTable() {
    var t = new Int32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      t[n] = c;
    }
    return t;
  }
  function pngCrc32(buf) {
    if (!_crcTable) _crcTable = buildCrcTable();
    var c = 0xffffffff;
    for (var i = 0; i < buf.length; i++) {
      c = _crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  // 将普通 JS 字符串转成 Latin-1 (ISO-8859-1) Uint8Array
  function pngLatin1(str) {
    var out = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) out[i] = str.charCodeAt(i) & 0xff;
    return out;
  }

  // 向 canvas.toDataURL() 返回的 PNG DataURL 注入 tEXt 元数据块
  function injectPngMetadata(dataUrl, metaObj) {
    var b64    = dataUrl.split(',')[1];
    var binary = atob(b64);
    var len    = binary.length;
    var buf    = new Uint8Array(len);
    for (var i = 0; i < len; i++) buf[i] = binary.charCodeAt(i);

    var pos = 8;
    while (pos < buf.length) {
      var chunkLen = (buf[pos] << 24) | (buf[pos + 1] << 16) |
                     (buf[pos + 2] <<  8) | buf[pos + 3];
      var type = String.fromCharCode(buf[pos + 4], buf[pos + 5],
                                     buf[pos + 6], buf[pos + 7]);
      if (type === 'IEND') break;
      pos += 12 + chunkLen;
    }

    var metaChunks = [];
    var keys = Object.keys(metaObj);
    for (var ki = 0; ki < keys.length; ki++) {
      var key   = keys[ki];
      var val   = metaObj[key];
      var bytes = pngLatin1(key + '\0' + val);
      var crc   = pngCrc32(bytes);
      var chunk = new Uint8Array(4 + 4 + bytes.length + 4);
      chunk[0] = (bytes.length >> 24) & 0xff;
      chunk[1] = (bytes.length >> 16) & 0xff;
      chunk[2] = (bytes.length >>  8) & 0xff;
      chunk[3] =  bytes.length        & 0xff;
      chunk[4] = 0x74; chunk[5] = 0x45; chunk[6] = 0x58; chunk[7] = 0x74;
      for (var j = 0; j < bytes.length; j++) chunk[8 + j] = bytes[j];
      chunk[chunk.length - 4] = (crc >> 24) & 0xff;
      chunk[chunk.length - 3] = (crc >> 16) & 0xff;
      chunk[chunk.length - 2] = (crc >>  8) & 0xff;
      chunk[chunk.length - 1] =  crc        & 0xff;
      metaChunks.push(chunk);
    }

    var totalLen = pos + metaChunks.reduce(function (s, c) { return s + c.length; }, 0) + (buf.length - pos);
    var out = new Uint8Array(totalLen);
    out.set(buf.subarray(0, pos), 0);
    var off = pos;
    for (var mi = 0; mi < metaChunks.length; mi++) {
      out.set(metaChunks[mi], off);
      off += metaChunks[mi].length;
    }
    out.set(buf.subarray(pos), off);

    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var str   = '';
    for (var q = 0; q < out.length; q += 3) {
      var b0 = out[q], b1 = q + 1 < out.length ? out[q + 1] : 0, b2 = q + 2 < out.length ? out[q + 2] : 0;
      str += chars[b0 >> 2] + chars[((b0 & 3) << 4) | (b1 >> 4)];
      str += q + 1 < out.length ? chars[((b1 & 15) << 2) | (b2 >> 6)] : '=';
      str += q + 2 < out.length ? chars[b2 & 63] : '=';
    }
    return 'data:image/png;base64,' + str;
  }

  // ── PNG export ──────────────────────────────────────────────
  function downloadPng() {
    if (typeof html2canvas === 'undefined') {
      statusEl.textContent = '图片库未加载，请检查网络后重试。';
      statusEl.className = 'status-msg';
      return;
    }

    var opts = getOpts();

    // 720p 低分辨率提示
    if (opts.resolution === '720p') {
      statusEl.textContent = '⚠ 720p 分辨率偏低，日历文字可能模糊，建议使用 1080p 及以上。';
      statusEl.className = 'status-msg status-warn';
    } else {
      statusEl.textContent = '正在生成图片…';
      statusEl.className = 'status-msg';
    }

    btnDownload.disabled = true;

    html2canvas(exportRoot, {
      scale: RESOLUTION_SCALES[opts.resolution] || 6,
      backgroundColor: null,
      useCORS: true,
      logging: false
    }).then(function (canvas) {
      var scale  = RESOLUTION_SCALES[opts.resolution] || 6;
      var meta   = {
        'Software':   'WhyCalendar',
        'Copyright':  '浙江台州Why集团',
        'DateRange':  startInput.value + ' \u2014 ' + endInput.value,
        'Resolution': opts.resolution + ' (' + (390 * scale) + 'px)',
        'Theme':      opts.darkMode ? 'Dark' : 'Light'
      };
      var annotated = injectPngMetadata(canvas.toDataURL('image/png'), meta);

      var a = document.createElement('a');
      a.download = 'WhyCalendar-' + startInput.value + '_' + endInput.value + '.png';
      a.href = annotated;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      statusEl.textContent = '已下载 PNG（含元数据）。';
      statusEl.className = 'status-msg';
      btnDownload.disabled = false;
    }).catch(function () {
      statusEl.textContent = '导出失败，请重试。';
      statusEl.className = 'status-msg';
      btnDownload.disabled = false;
    });
  }

  // ── Persistent options via localStorage ──────────────────────
  var DEFAULTS = {
    darkMode:      false,
    hideOot:       true,
    monthDivider:  false,
    todayHighlight: true,
    roundedCorner:  true,
    fontEn:        'Arial',
    fontCn:        'Microsoft YaHei',
    resolution:    DEFAULT_RESOLUTION
  };

  function saveOpts() {
    try {
      localStorage.setItem('whycal-opts', JSON.stringify({
        darkMode:       darkModeToggle.checked,
        hideOot:        hideOotToggle.checked,
        monthDivider:   monthDividerToggle.checked,
        todayHighlight: todayHighlightToggle.checked,
        roundedCorner:  roundedCornerToggle.checked,
        fontEn:         fontEnSelect.value,
        fontCn:         fontCnSelect.value,
        resolution:     resolutionSelect.value || DEFAULT_RESOLUTION
      }));
    } catch (_) {}
  }

  function restoreOpts() {
    darkModeToggle.checked       = DEFAULTS.darkMode;
    hideOotToggle.checked        = DEFAULTS.hideOot;
    monthDividerToggle.checked   = DEFAULTS.monthDivider;
    todayHighlightToggle.checked = DEFAULTS.todayHighlight;
    roundedCornerToggle.checked  = DEFAULTS.roundedCorner;
    setSelectValueSafe(fontEnSelect, DEFAULTS.fontEn, DEFAULTS.fontEn);
    setSelectValueSafe(fontCnSelect, DEFAULTS.fontCn, DEFAULTS.fontCn);
    setSelectValueSafe(resolutionSelect, DEFAULTS.resolution, DEFAULTS.resolution);

    try {
      var saved = JSON.parse(localStorage.getItem('whycal-opts'));
      if (!saved) return;
      darkModeToggle.checked       = !!saved.darkMode;
      hideOotToggle.checked        = !!saved.hideOot;
      monthDividerToggle.checked   = !!saved.monthDivider;
      todayHighlightToggle.checked = !!saved.todayHighlight;
      roundedCornerToggle.checked  = !!saved.roundedCorner;
      setSelectValueSafe(fontEnSelect, saved.fontEn, DEFAULTS.fontEn);
      setSelectValueSafe(fontCnSelect, saved.fontCn, DEFAULTS.fontCn);
      setSelectValueSafe(resolutionSelect, saved.resolution, DEFAULTS.resolution);
    } catch (_) {}
  }

  // ── Year picker overlay (iOS Calendar Style) ───────────────
  function openYearPicker(startDate, onSelect) {
    const existingPicker = document.querySelector('.year-picker-overlay');
    if (existingPicker) existingPicker.remove();

    const currentYear = startDate.getFullYear();
    const todayYear = new Date().getFullYear();
    const startYear = 2000;
    const endYear = 2100;

    // Determine which decade to show
    const decadeStart = Math.floor(currentYear / 10) * 10;
    const decadeEnd = decadeStart + 9;

    const opts = getOpts();
    const isDark = opts.darkMode;
    const modalClass = isDark ? 'yp-dark' : 'yp-light';

    const overlay = document.createElement('div');
    overlay.className = 'year-picker-overlay';
    overlay.innerHTML = `
      <div class="year-picker-modal ${modalClass}">
        <div class="yp-header">
          <button class="yp-cancel">取消</button>
          <span class="yp-title">选择年份</span>
          <button class="yp-done">完成</button>
        </div>
        <div class="yp-nav-section" style="justify-content: center; padding: 0 16px 8px;">
          <button class="yp-nav-btn" data-dir="-1" ${decadeStart <= startYear ? 'disabled' : ''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <span class="yp-title" style="font-size: 15px;">${decadeStart} - ${decadeEnd}</span>
          <button class="yp-nav-btn" data-dir="1" ${decadeEnd >= endYear ? 'disabled' : ''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
        <div class="yp-year-grid" data-start="${decadeStart}" data-end="${decadeEnd}">
          ${generateYearButtons(decadeStart, decadeEnd, currentYear, todayYear)}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const modal = overlay.querySelector('.year-picker-modal');
    const grid = overlay.querySelector('.yp-year-grid');

    // Close on cancel or done
    overlay.querySelector('.yp-cancel').addEventListener('click', function() {
      overlay.remove();
    });

    overlay.querySelector('.yp-done').addEventListener('click', function() {
      overlay.remove();
    });

    // Click outside to close
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.remove();
    });

    // Navigation buttons
    overlay.querySelectorAll('.yp-nav-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (this.disabled) return;

        const dir = parseInt(this.dataset.dir);
        let start = parseInt(grid.dataset.start);
        let end = parseInt(grid.dataset.end);

        start += dir * 10;
        end += dir * 10;

        if (start < startYear) { start = startYear; end = startYear + 9; }
        if (end > endYear) { end = endYear; start = endYear - 9; }

        grid.dataset.start = start;
        grid.dataset.end = end;

        // Update nav buttons
        overlay.querySelectorAll('.yp-nav-btn')[0].disabled = start <= startYear;
        overlay.querySelectorAll('.yp-nav-btn')[1].disabled = end >= endYear;

        // Update range display
        overlay.querySelectorAll('.yp-title')[1].textContent = start + ' - ' + end;

        grid.innerHTML = generateYearButtons(start, end, currentYear, todayYear);
        attachYearButtonListeners(grid, onSelect, overlay);
      });
    });

    // Year button clicks
    attachYearButtonListeners(grid, onSelect, overlay);
  }

  function generateYearButtons(start, end, currentYear, todayYear) {
    let html = '';
    for (let y = start; y <= end; y++) {
      let classes = 'yp-year-btn';
      if (y === currentYear) classes += ' yp-selected';
      if (y === todayYear) classes += ' yp-today';
      html += `<button class="${classes}" data-year="${y}">${y}</button>`;
    }
    return html;
  }

  function attachYearButtonListeners(grid, onSelect, overlay) {
    grid.querySelectorAll('.yp-year-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        // Update selection UI
        grid.querySelectorAll('.yp-year-btn').forEach(function(b) {
          b.classList.remove('yp-selected');
        });
        this.classList.add('yp-selected');

        // Trigger select
        const year = parseInt(this.dataset.year);
        overlay.remove();
        onSelect(year);
      });
    });
  }

  function adjustYear(startDate, endDate, newYear) {
    const oldYear = startDate.getFullYear();
    const diff = newYear - oldYear;

    const newStart = new Date(startDate);
    newStart.setFullYear(newYear);

    const newEnd = new Date(endDate);
    newEnd.setFullYear(endDate.getFullYear() + diff);

    startInput.value = toDateKey(newStart);
    endInput.value = toDateKey(newEnd);

    validateAndRender();
  }

  // ── Init ────────────────────────────────────────────────────
  function defaultRange() {
    var t = new Date();
    var s = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    var e = new Date(s);
    e.setDate(e.getDate() + 13);
    startInput.value = toDateKey(s);
    endInput.value   = toDateKey(e);
  }

  document.addEventListener('DOMContentLoaded', function () {
    restoreOpts();        // 优先读 localStorage，无则用默认值
    defaultRange();

    btnRender.addEventListener('click', validateAndRender);
    btnDownload.addEventListener('click', downloadPng);

    [darkModeToggle, hideOotToggle, monthDividerToggle, todayHighlightToggle, roundedCornerToggle]
      .forEach(function (el) {
        el.addEventListener('change', function () { saveOpts(); validateAndRender(); });
      });

    [fontEnSelect, fontCnSelect, resolutionSelect]
      .forEach(function (el) {
        el.addEventListener('change', function () { saveOpts(); validateAndRender(); });
      });

    validateAndRender();
  });
})();
