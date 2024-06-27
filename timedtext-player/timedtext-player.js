var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, css } from 'lit';
import { html, unsafeStatic } from 'lit/static-html.js';
import { customElement, state, property, queryAll } from 'lit/decorators.js';
import { finder } from '@medv/finder';
import { interpolate } from './utils';
// class TextTrack {
//   constructor(players: NodeListOf<HTMLMediaElement>) {
//     this._players = players;
//   }
//   _players: NodeListOf<HTMLMediaElement>;
//   _mode = 'showing' as TextTrackMode;
//   get mode(): TextTrackMode {
//     return this._mode;
//   }
//   set mode(mode: TextTrackMode) {
//     console.log(`setting mode to ${mode}`, this._players);
//     this._mode = mode;
//     this._players.forEach((p) => {
//       const track = p.textTracks[0];
//       if (track) track.mode = mode;
//     });
//   }
// }
let TimedTextPlayer = class TimedTextPlayer extends LitElement {
    constructor() {
        super(...arguments);
        this.time = 0;
        this.playing = false;
        this._duration = 0;
        this._muted = false;
        this._volume = 1;
        this.track = null;
        this._playersReady = [];
        // private isPlayerReady(player: HTMLMediaElement) {
        //   return this._playersReady.includes(player);
        // }
        // textTracks: TextTrack[] = [];
        this._playersEventsCounter = new Map();
        this.pauseMutationObserver = "false";
        this._observer = undefined;
        // TODO transcriptSelector property
        this.playerTemplateSelector = '';
        this.transcriptTemplateSelector = 'article'; // TODO article has section data-t?
        this._start = 0;
        this._end = 0;
        this._section = null;
        this._clip = null;
        this._timedText = null;
        this._timedTextTime = 0;
        this._eventCounter = 0;
        this._triggerTimeUpdateTimeout = 0;
        // protected override createRenderRoot() {
        //   return this;
        // }
    }
    set currentTime(time) {
        this._seek(time);
        // cancel end
        this._end = this._duration;
    }
    get currentTime() {
        return this.time;
    }
    set currentPseudoTime(time) {
        this._dispatchTimedTextEvent(time);
    }
    get seeking() {
        const players = Array.from(this._players);
        return players.some((p) => p.seeking);
    }
    get paused() {
        return !this.playing;
    }
    play() {
        const player = this._currentPlayer();
        if (!player)
            return;
        player.play();
    }
    pause() {
        const player = this._currentPlayer();
        if (!player)
            return;
        player.pause();
    }
    get duration() {
        return this._duration;
    }
    set muted(muted) {
        this._players.forEach((p) => p.muted = muted);
        this._muted = muted;
    }
    get muted() {
        return this._muted;
    }
    get volume() {
        return this._volume;
    }
    set volume(volume) {
        this._players.forEach((p) => p.volume = volume);
    }
    get playersEventsCounter() {
        return Array.from(this._playersEventsCounter.entries()).map(([player, eventsCounter]) => {
            return { player, eventsCounter };
        });
    }
    // const sections: NodeListOf<HTMLElement> | undefined = article.querySelectorAll('section[data-media-src]');
    _dom2otio(sections) {
        if (!sections)
            return;
        this.track = {
            OTIO_SCHEMA: 'Track.1',
            name: 'Transcript',
            kind: 'Video',
            children: Array.from(sections).map((s) => {
                const src = s.getAttribute('data-media-src');
                const [start, end] = (s.getAttribute('data-t') ?? '0,0').split(',').map(v => parseFloat(v));
                const children = s.querySelectorAll('p[data-t]:not(*[data-effect]), div[data-t]:not(*[data-effect])');
                const effects = s.querySelectorAll('div[data-t][data-effect]');
                return {
                    OTIO_SCHEMA: 'Clip.1',
                    source_range: {
                        start_time: start,
                        duration: end - start
                    },
                    media_reference: {
                        OTIO_SCHEMA: 'MediaReference.1',
                        target: src,
                    },
                    metadata: {
                        element: s,
                        selector: finder(s, { root: s.parentElement }),
                        playerTemplateSelector: s.getAttribute('data-player'),
                        data: s.getAttributeNames().filter(n => n.startsWith('data-')).reduce((acc, n) => ({ ...acc, [n.replace('data-', '').replace('-', '_')]: s.getAttribute(n) }), {}),
                    },
                    children: Array.from(children).map((c) => {
                        const [start, end] = (c.getAttribute('data-t') ?? '0,0').split(',').map(v => parseFloat(v));
                        const children = c.querySelectorAll('*[data-t],*[data-m]');
                        const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' }); // TODO language detection? from page?
                        // const text = c.textContent ?? ''; // TBD this has a lot of whitespace and might have non timed text?
                        const text = Array.from(children).map((t) => t.textContent).join(' '); // TBD this is the timed text only
                        const sentences = [...segmenter.segment(text)[Symbol.iterator]()].map(({ index, segment: text }) => ({ index, text }));
                        return {
                            OTIO_SCHEMA: 'Clip.1',
                            source_range: {
                                start_time: start,
                                duration: end - start
                            },
                            media_reference: {
                                OTIO_SCHEMA: 'MediaReference.1',
                                target: src,
                            },
                            metadata: {
                                element: c,
                                transcript: c.textContent,
                                selector: finder(c, { root: s.parentElement }),
                                data: c.getAttributeNames().filter(n => n.startsWith('data-')).reduce((acc, n) => ({ ...acc, [n.replace('data-', '').replace('-', '_')]: c.getAttribute(n) }), {}),
                                text,
                                sentences,
                            },
                            timed_texts: Array.from(children).map((t, i, arr) => {
                                let start, end;
                                if (t.getAttribute('data-t')) {
                                    const f = (t.getAttribute('data-t') ?? '0,0').split(',').map(v => parseFloat(v));
                                    start = f[0];
                                    end = f[1];
                                }
                                else {
                                    start = parseFloat(t.getAttribute('data-m') ?? '') / 1e3;
                                    end = start + parseFloat(t.getAttribute('data-d') ?? '') / 1e3;
                                }
                                const prefix = arr.slice(0, i).map((t) => t.textContent ?? '').join(' ') + (i > 0 ? ' ' : '');
                                const textOffset = prefix.length;
                                const text = (t.textContent ?? '');
                                const sentence = Array.from(sentences).reverse().find(({ index }) => textOffset >= index);
                                const sos = sentence?.index === textOffset;
                                const eos = sentence?.index + sentence?.text.trim().length === textOffset + text.length;
                                const punct = !!text.trim().charAt(text.length - 1).match(/\p{P}/gu);
                                return {
                                    OTIO_SCHEMA: 'TimedText.1',
                                    marked_range: {
                                        start_time: start,
                                        duration: end - start
                                    },
                                    texts: t.textContent ?? '',
                                    style_ids: [],
                                    metadata: {
                                        element: t,
                                        selector: finder(t, { root: s.parentElement }),
                                        textOffset,
                                        sos,
                                        eos,
                                        length: text.length,
                                        punct,
                                        // ruby: `<ruby>${text}<rt>${eos ? 'eos ' : ''}${sos ? 'sos ' : ''}${punct ? 'punct ' : ''}</rt></ruby>`,
                                        ruby: `<ruby>${text}</ruby>`, // FIXME
                                    },
                                };
                            }),
                            effects: [],
                        };
                    }) //
                        .map((p) => {
                        const tt = p.timed_texts ?? [];
                        tt.forEach((t, i, arr) => {
                            if (i === 0)
                                return;
                            const prev = arr[i - 1];
                            if (t.metadata.sos)
                                prev.metadata.eos = true;
                        });
                        tt.forEach((t, i, arr) => {
                            if (i === 0) {
                                t.metadata.lastBreak = 0;
                                t.metadata.captionGroup = `c${p.source_range.start_time}-${t.metadata.lastBreak}`;
                                return;
                            }
                            t.metadata.lastBreak = arr[i - 1].metadata.lastBreak;
                            t.metadata.captionGroup = `c${p.source_range.start_time}-${t.metadata.lastBreak}`;
                            if (t.metadata.textOffset + t.metadata.length - t.metadata.lastBreak >= 37 * 2 || i === arr.length - 1) {
                                const candidates = arr.slice(i - 5 < 0 ? 0 : i - 5, i);
                                // find previous punctuation
                                let item = candidates.reverse().find(({ metadata: { eos } }) => eos) ?? candidates.find(({ metadata: { punct } }) => punct) ?? t;
                                item.metadata.pilcrow0 = true;
                                //  avoid widows
                                if (i < tt.length - 5) {
                                    // look ahead 2 items for punctuation
                                    item = tt.slice(i, i + 3).find(({ metadata: { punct } }) => punct) ?? t;
                                    item.metadata.pilcrow2 = true;
                                }
                                else if (i >= tt.length - 5) {
                                    // we have few items left, use first candidates (eos, punct)
                                    item = tt.slice(i).find(({ metadata: { eos } }) => eos) ?? candidates.find(({ metadata: { punct } }) => punct) ?? t;
                                    item.metadata.pilcrow3 = true;
                                }
                                t.metadata.pilcrow = true;
                                t.metadata.lastBreak = t.metadata.textOffset + t.metadata.length + 1;
                                // item.metadata.lastBreak = item.metadata.textOffset + item.metadata.length + 1;
                            }
                        });
                        return p;
                    }).reduce((acc, c, i, arr) => {
                        if (i === 0 || i === arr.length - 1)
                            return [...acc, c];
                        const prev = arr[i - 1];
                        if (c.source_range.start_time === prev.source_range.start_time + prev.source_range.duration)
                            return [...acc, c];
                        const gap = {
                            OTIO_SCHEMA: 'Gap.1',
                            source_range: {
                                start_time: prev.source_range.start_time + prev.source_range.duration,
                                duration: c.source_range.start_time - (prev.source_range.start_time + prev.source_range.duration)
                            },
                            media_reference: {
                                OTIO_SCHEMA: 'MediaReference.1',
                                target: src,
                            }
                        };
                        return [...acc, gap, c];
                    }, []),
                    effects: Array.from(effects).map((effect) => {
                        return {
                            name: effect.getAttribute('data-effect') ?? '',
                            metadata: {
                                element: effect,
                                selector: finder(effect, { root: s.parentElement }),
                                data: effect.getAttributeNames().filter(n => n.startsWith('data-')).reduce((acc, n) => ({ ...acc, [n.replace('data-', '').replace('-', '_')]: effect.getAttribute(n) }), {}),
                            },
                            source_range: {
                                start_time: parseFloat(effect.getAttribute('data-t')?.split(',')[0] ?? '0'),
                                duration: parseFloat(effect.getAttribute('data-t')?.split(',')[1] ?? '0') - parseFloat(effect.getAttribute('data-t')?.split(',')[0] ?? '0'),
                            }
                        };
                    })
                };
            }).map((segment) => {
                segment.metadata.captions = this.getCaptions(segment);
                segment.metadata.captionsUrl = URL.createObjectURL(new Blob([segment.metadata.captions], { type: "text/vtt" }));
                return segment;
            }),
            markers: [],
            metadata: {},
            effects: [],
        };
        console.log({ track: this.track });
        this._duration = this.track.children.reduce((acc, c) => acc + c.source_range.duration, 0);
        // this.textTracks = [new TextTrack(this._players)]
    }
    getCaptions(segment) {
        const clips = segment.children;
        const timedTexts = clips.flatMap((c) => c.timed_texts ?? []);
        const grouped = timedTexts.reduce((acc, obj) => {
            // Initialize the sub-array for the group if it doesn't exist
            if (!acc[obj.metadata.captionGroup]) {
                acc[obj.metadata.captionGroup] = [];
            }
            // Append the object to the correct group
            acc[obj.metadata.captionGroup].push(obj);
            return acc;
        }, {});
        const captions = Object.values(grouped);
        console.log({ captions });
        const captions2 = captions.reduce((acc, g) => {
            const p = g.findIndex(t => t.metadata.pilcrow);
            const p0 = g.findIndex(t => t.metadata.pilcrow0);
            if (p0 < p) {
                const tail = g.slice(p0 + 1);
                tail[tail.length - 1].metadata.glue = true;
                tail[tail.length - 1].metadata.pilcrow = false;
                tail[tail.length - 1].metadata.pilcrow4 = true;
                return [...acc, g.slice(0, p0 + 1), tail];
            }
            // default
            return [...acc, g];
        }, []);
        const captions3 = captions2.reduce((acc, g, i) => {
            if (i === 0)
                return [...acc, g];
            const prev = acc.pop();
            if (prev && prev[prev.length - 1]?.metadata?.glue) {
                return [...acc, [...prev, ...g]];
            }
            // default
            return [...acc, prev, g];
        }, []);
        console.log({ captions2, captions3 });
        const formatSeconds = (seconds) => seconds ? new Date(parseFloat(seconds.toFixed(3)) * 1000).toISOString().substring(11, 23) : '00:00:00:000';
        let vttOut = ['WEBVTT',
            '',
            'Kind: captions',
            'Language: en-US',
            '',
            ''].join('\n');
        captions3.forEach((tt, i) => {
            const first = tt[0];
            const last = tt[tt.length - 1];
            // let text = tt.map(t => t.texts)
            const text = tt.map((t) => t.metadata.ruby
                // + (t.metadata.pilcrow ? '<c.yellow>¶</c>' : '')
                // + (t.metadata.pilcrow0 ? '<c.yellow>◊</c>' : '')
                // + (t.metadata.pilcrow2 ? '<c.yellow>†</c>' : '')
                // + (t.metadata.pilcrow3 ? '<c.yellow>‡</c>' : '')
                // + (t.metadata.pilcrow4 ? '<c.yellow>⌑</c>' : '')
                + `<${formatSeconds(t.marked_range.start_time)}>`).join(' ');
            // const text = tt.map((t) => `<${formatSeconds(t.marked_range.start_time)}>` + '<c>' + t.texts + '</c>' + (t.metadata.pilcrow ? '<c.yellow>¶</c>' : '') + (t.metadata.pilcrow2 ? '<c.yellow>*</c>' : '')).join(' ');
            const id = `${i}`;
            vttOut += `${id}\n${formatSeconds(first?.marked_range?.start_time)} --> ${formatSeconds(last?.marked_range?.start_time + last?.marked_range?.duration)}\n${text}\n\n`;
        });
        return vttOut;
    }
    parseTranscript() {
        const article = document.querySelector(this.transcriptTemplateSelector);
        console.log({ article });
        if (!article)
            return;
        const sections = article.querySelectorAll('section[data-media-src]');
        console.log({ sections });
        this._dom2otio(sections);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    callback(mutationList, _observer) {
        if (this.pauseMutationObserver === "true")
            return; // FIXME property should be boolean but in react I get string
        let article;
        for (const mutation of mutationList) {
            if (mutation.type === "childList") {
                console.log("A child node has been added or removed.");
                article = mutation.target;
            }
            else if (mutation.type === "attributes") {
                console.log(`The ${mutation.attributeName} attribute was modified.`);
            }
        }
        console.log({ mutationList, _observer, article: article });
        if (!article)
            return;
        const sections = article.querySelectorAll('section[data-media-src]');
        console.log({ sections });
        this._dom2otio(sections);
    }
    render() {
        let overlay;
        // if (this._clip && (this._clip as Clip).metadata.data.effect) {
        //   const clip = this._clip as Clip;
        //   const template = document.createElement('template');
        //   template.innerHTML = interpolate((document.querySelector<HTMLTemplateElement>(clip.metadata.data.effect)?.innerHTML ?? '').trim(), { src: clip.media_reference.target, ...clip.metadata?.data });
        //   overlay = template.content.childNodes as NodeListOf<HTMLElement>;
        // }
        // console.log({overlay, clip: this._clip});
        return html `<div>
      ${this.track ? this.track.children.map((clip, i, arr) => {
            const offset = arr.slice(0, i).reduce((acc, c) => acc + c.source_range.duration, 0);
            const duration = clip.source_range.duration;
            const template = document.createElement('template');
            template.innerHTML = interpolate((document.querySelector(clip.metadata.playerTemplateSelector ?? this.playerTemplateSelector)?.innerHTML ?? '').trim(), {
                src: clip.media_reference.target,
                captions: clip.metadata.captionsUrl,
                ...clip.metadata?.data,
                width: this.width ?? 'auto',
                height: this.height ?? 'auto',
            });
            const node = template.content.childNodes[0];
            const tag = node.nodeName.toLowerCase();
            const attrs = Array.from(node.attributes).map((attr) => `${(attr.name)}=${attr.value !== '' ? attr.value : '""'}`);
            const siblings = Array.from(template.content.childNodes).slice(1);
            const overlays = clip.effects.flatMap((effect) => {
                const start = effect.source_range.start_time - clip.source_range.start_time + offset;
                const end = start + effect.source_range.duration;
                // console.log({start, end, time: this.time});
                if (start <= this.time && this.time < end) {
                    const progress = (this.time - start) / effect.source_range.duration;
                    const template = document.createElement('template');
                    template.innerHTML = interpolate((document.querySelector(effect.metadata.data.effect)?.innerHTML ?? '').trim(), { progress, ...effect.metadata?.data });
                    return template.content.childNodes;
                }
                return null;
            });
            // if (overlays?.length ?? 0 > 0)
            // console.log({overlays});
            return html `<div class=${offset <= this.time && this.time < offset + duration ? 'active wrapper' : 'wrapper'} style="width: ${this.width ?? 'auto'}px; height: ${this.height ?? 'auto'}px"><${unsafeStatic(tag)} ${unsafeStatic(attrs.join(' '))}
            data-t=${`${clip.source_range.start_time},${clip.source_range.start_time + duration}`}
            data-offset=${offset}
            _class=${offset <= this.time && this.time < offset + duration ? 'active' : ''}
            style="width: ${this.width}px; height: ${this.height}px"

            @timeupdate=${this._onTimeUpdate}
            @canplay=${this._onCanPlay}
            @play=${this._onPlay}
            @pause=${this._onPause}
            @loadedmetadata=${this._onLoadedMetadata}

            @abort=${this._relayEvent}
            @canplaythrough=${this._relayEvent}
            @durationchange=${this._relayEvent}
            @emptied=${this._relayEvent}
            @ended=${this._relayEvent}
            @loadeddata=${this._relayEvent}
            @loadstart=${this._relayEvent}
            @playing=${this._relayEvent}
            @progress=${this._relayEvent}
            @ratechange=${this._relayEvent}
            @seeked=${this._onSeeked}
            @seeking=${this._relayEvent}
            @suspend=${this._relayEvent}
            @waiting=${this._relayEvent}
            @error=${this._relayEvent}
            @volumechange=${this._relayEvent}
            >
              <track default kind="captions" srclang="en" src="${clip.metadata.captionsUrl}" />
              ${node.children}
            </${unsafeStatic(tag)}>
            ${siblings}
            <!-- overlays -->
            ${overlays}
          </div>`;
        }) : null}
      ${overlay}
      </div>
      <div style="height: 40px"></div>
      <!-- <slot name="transcript" @slotchange=${this.handleSlotchange} @click=${this.handleSlotClick}></slot> -->
    `;
    }
    _countEvent(e) {
        if (this._playersEventsCounter.has(e.target)) {
            const eventsCounter = this._playersEventsCounter.get(e.target) ?? {};
            const counter = eventsCounter[e.type] ?? 0;
            this._playersEventsCounter.set(e.target, { ...eventsCounter, [e.type]: counter + 1 });
        }
        else {
            this._playersEventsCounter.set(e.target, { [e.type]: 1 });
        }
    }
    _relayEvent(e) {
        this._countEvent(e);
        console.log(e.type);
        // this.dispatchEvent(new CustomEvent(e.type));
    }
    _ready() {
        // this.dispatchEvent(new CustomEvent('ready'));
        console.log('ready');
        const url = new URL(window.location.href);
        const t = url.searchParams.get('t');
        console.log({ t });
        if (t) {
            const [start, end] = t.split(',').map(v => parseFloat(v));
            this._start = start;
            this._end = end;
            console.log({ _start: this._start, _end: this._end });
            setTimeout(() => {
                this._seek(start);
                setTimeout(() => this._playerAtTime(start)?.play(), 1000);
            }, 1000);
        }
        else {
            this._end = this._duration;
        }
    }
    _onLoadedMetadata(e) {
        this._countEvent(e);
        // this.dispatchEvent(new CustomEvent(e.type));
        if (this._playersReady.includes(e.target))
            return;
        this._playersReady.push(e.target);
        // if all players are ready
        if (this._playersReady.length === this._players.length) {
            this._ready();
        }
    }
    _onSeeked(e) {
        this._countEvent(e);
        const { target: player } = e;
        const [start, end] = (player.getAttribute('data-t') ?? '0,0').split(',').map(v => parseFloat(v));
        const offset = parseFloat(player.getAttribute('data-offset') ?? '0');
        if (start <= player.currentTime && player.currentTime <= end) {
            if (this.playing && player.paused && player.currentTime - start + offset === this.time)
                player.play();
        }
    }
    connectedCallback() {
        super.connectedCallback();
        // const article = document.getElementById('transcript');
        const article = document.querySelector(this.transcriptTemplateSelector);
        console.log({ article });
        if (!article)
            return;
        this._observer = new MutationObserver(this.callback.bind(this));
        this._observer.observe(article, { attributes: true, childList: true, subtree: true });
        const sections = article.querySelectorAll('section[data-media-src]');
        console.log({ sections });
        this._dom2otio(sections);
        article.addEventListener('click', this._transcriptClick.bind(this));
    }
    _transcriptClick(e) {
        const element = e.target;
        if (!element || element?.nodeName !== 'SPAN')
            return;
        console.log({ element });
        // const sectionElement = element.parentElement?.parentElement;
        const sectionElement = element.closest('section'); // this.parents(element, 'section')[0];
        // console.log({sectionElement});
        const section = this.track?.children.find((c) => c.metadata.element === sectionElement);
        console.log({ section });
        if (!section)
            return;
        const sectionIndex = this.track?.children.indexOf(section);
        const offset = this.track?.children.slice(0, sectionIndex).reduce((acc, c) => acc + c.source_range.duration, 0) ?? 0;
        console.log({ sectionIndex, offset });
        let start;
        if (element.getAttribute('data-t')) {
            const f = (element.getAttribute('data-t') ?? '0,0').split(',').map(v => parseFloat(v));
            start = f[0];
        }
        else {
            start = parseFloat(element.getAttribute('data-m') ?? '') / 1e3;
        }
        const time = start - section.source_range.start_time + offset;
        console.log(time);
        this._seek(time);
    }
    _playerAtTime(time) {
        const players = Array.from(this._players);
        return players.find((p) => {
            const [start, end] = (p.getAttribute('data-t') ?? '0,0').split(',').map(v => parseFloat(v));
            const offset = parseFloat(p.getAttribute('data-offset') ?? '0');
            return start <= time - offset + start && time - offset + start <= end;
        });
    }
    _currentPlayer() {
        return this._playerAtTime(this.time);
    }
    _clipAtTime(time) {
        if (!this.track)
            return {};
        const section = this.track.children.find((c, i, arr) => {
            const offset = arr.slice(0, i).reduce((acc, c) => acc + c.source_range.duration, 0);
            const start = c.source_range.start_time;
            const end = c.source_range.start_time + c.source_range.duration;
            const sourceTime = time - offset + start;
            return start <= sourceTime && sourceTime <= end;
        });
        if (!section)
            return {};
        const offset = this.track.children.slice(0, this.track.children.indexOf(section)).reduce((acc, c) => acc + c.source_range.duration, 0);
        const sourceTime = time - offset + section.source_range.start_time;
        const clip = section.children.find((c) => {
            const start = c.source_range.start_time;
            const end = c.source_range.start_time + c.source_range.duration;
            return start <= sourceTime && sourceTime <= end;
        });
        if (!clip)
            return { section, clip: null, timedText: null };
        let timedText = clip.timed_texts?.find((t) => {
            const start = t.marked_range.start_time;
            const end = t.marked_range.start_time + t.marked_range.duration;
            return start <= sourceTime && sourceTime <= end;
        });
        const altTimedText = clip.timed_texts?.find((t) => {
            const start = t.marked_range.start_time;
            return sourceTime < start;
        }) ?? [...(clip?.timed_texts ?? [])].reverse().find((t) => {
            const start = t.marked_range.start_time;
            return start <= sourceTime;
        });
        if (!timedText && altTimedText) {
            // console.log({time, offset, sourceTime, altTimedText});
            timedText = altTimedText;
        }
        return { section, clip, timedText };
    }
    _dispatchTimedTextEvent(time) {
        const { section, clip, timedText } = this._clipAtTime(time ?? this.time);
        if (!section || !clip)
            return;
        const sectionIndex = this.track?.children.indexOf(section);
        const offset = this.track?.children.slice(0, sectionIndex).reduce((acc, c) => acc + c.source_range.duration, 0);
        // if (this._section !== section) {
        //   this.dispatchEvent(new CustomEvent('playhead', {detail: {section, offset}}));
        //   this._section = section;
        // }
        if (this._clip !== clip) {
            // this.dispatchEvent(new CustomEvent('playhead', {detail: {clip, section, offset}}));
            this._clip = clip;
        }
        // if (this._timedText !== timedText) {
        if (this._timedTextTime !== time ?? this.time) {
            this.dispatchEvent(new CustomEvent('playhead', {
                bubbles: true,
                detail: {
                    counter: this._eventCounter++,
                    text: timedText?.texts,
                    time: this.time,
                    offset,
                    pseudo: !!time,
                    pseudoTime: time,
                    transcript: this.transcriptTemplateSelector,
                    media: section.media_reference.target,
                    timedText,
                    clip,
                    section,
                }
            }));
            this._timedText = timedText;
            this._timedTextTime = time ?? this.time;
        }
        else {
            console.log('same timed text', time ?? this.time);
        }
        // TODO emit also source href, such that source pane can be activated and have sync karaoke?
    }
    _seek(time) {
        const player = this._playerAtTime(time);
        console.log({ time, player });
        if (!player)
            return;
        const currentPlayer = this._currentPlayer();
        const [start] = (player.getAttribute('data-t') ?? '0,0').split(',').map(v => parseFloat(v));
        const offset = parseFloat(player.getAttribute('data-offset') ?? '0');
        const playing = !!this.playing;
        if (playing && currentPlayer && currentPlayer !== player)
            currentPlayer.pause();
        player.currentTime = time - offset + start;
        if (playing && currentPlayer && currentPlayer !== player)
            this.playing = true;
    }
    _triggerTimeUpdate() {
        clearTimeout(this._triggerTimeUpdateTimeout);
        if (this.seeking)
            return;
        const player = this._currentPlayer();
        if (!player)
            return;
        player.dispatchEvent(new Event('timeupdate'));
        if (this.playing)
            this._triggerTimeUpdateTimeout = setTimeout(() => requestAnimationFrame(this._triggerTimeUpdate.bind(this)), 1000 / 15); // TODO use Clock
    }
    _onTimeUpdate(e) {
        this._countEvent(e);
        if (this.playing && this.seeking)
            return;
        const { target: player } = e;
        const [start, end] = (player.getAttribute('data-t') ?? '0,0').split(',').map(v => parseFloat(v));
        const offset = parseFloat(player.getAttribute('data-offset') ?? '0');
        const players = Array.from(this._players);
        const i = players.indexOf(player);
        const nextPlayer = i <= players.length - 1 ? players[i + 1] : null;
        // test for end from media fragment URI
        if (this._end !== this._duration && this.time >= this._end)
            player.pause();
        if (player.currentTime < start) {
            player.currentTime = start;
            player.pause();
        }
        else if (start <= player.currentTime && player.currentTime <= end) {
            // if (this.playing && player.paused && player.currentTime - start + offset === this.time) player.play();
            if (player.currentTime !== start)
                this.time = player.currentTime - start + offset; // FIXME: that "if" to avoid 1st seek time update
            if (nextPlayer) {
                const [start3] = (nextPlayer.getAttribute('data-t') ?? '0,0').split(',').map(v => parseFloat(v));
                if (nextPlayer.currentTime !== start3)
                    nextPlayer.currentTime = start3;
            }
            this.dispatchEvent(new CustomEvent('timeupdate'));
            this._dispatchTimedTextEvent();
        }
        else if (end < player.currentTime) {
            player.pause();
            // TEST simulate overlap on clips
            // setTimeout(() => {
            //   player.pause();
            // }, 5000);
            if (nextPlayer)
                nextPlayer.play();
        }
    }
    _onCanPlay(e) {
        this._countEvent(e);
        const { target: player } = e;
        if (player.currentTime > 0)
            return;
        const [start] = (player.getAttribute('data-t') ?? '0,0').split(',').map(v => parseFloat(v));
        player.currentTime = start;
    }
    _onPlay(e) {
        this._countEvent(e);
        const { target: player } = e;
        const [start, end] = (player.getAttribute('data-t') ?? '0,0').split(',').map(v => parseFloat(v));
        if (start <= player.currentTime && player.currentTime <= end) {
            this.playing = true;
            this.dispatchEvent(new CustomEvent('play'));
        }
        this._triggerTimeUpdate();
    }
    _onPause(e) {
        this._countEvent(e);
        if (this.seeking)
            return;
        const { target: player } = e;
        const [start, end] = (player.getAttribute('data-t') ?? '0,0').split(',').map(v => parseFloat(v));
        if (start <= player.currentTime && player.currentTime <= end) {
            this.playing = false;
            this.dispatchEvent(new CustomEvent('pause'));
        }
    }
    handleSlotClick(e) {
        if (e.target.nodeName !== 'SPAN')
            return;
        // const [start, end] = (e.target.getAttribute('data-t') ?? '0,0' ).split(',').map(v => parseFloat(v));
    }
    handleSlotchange(e) {
        console.log('SLOT CHANGE');
        const childNodes = e.target.assignedNodes({ flatten: true });
        const article = childNodes.find((n) => n.nodeName === 'ARTICLE');
        if (!article)
            return;
        this._observer = new MutationObserver(this.callback.bind(this));
        this._observer.observe(article, { attributes: true, childList: true, subtree: true });
        const sections = article?.querySelectorAll('section[data-media-src]');
        this._dom2otio(sections);
    }
};
TimedTextPlayer.styles = document.location.href.indexOf('debug') > 0 ? css `
    :host {
      display: block;
    }
    .active {
      outline: 4px solid red;
      /* display: block !important; */
    }
    *[data-t] {
      margin: 10px;
    }
    .wrapper {
      position: relative;
      display: inline-block;
      /* display: none; */
      color: white;
    }
    video {
      /* width: 640px; */
    }
    video::cue(.yellow) {
      color: yellow;
    }
    ::cue:past {
      color: white;
    }
    ::cue:future {
      color: grey;
    }
  ` : css `
  :host {
      display: block;
    }
    .active {
      /* outline: 4px solid red; */
      display: block !important;
    }
    *[data-t] {
      /* margin: 10px; */
    }
    .wrapper {
      position: relative;
      /* display: inline-block; */
      display: none;
      color: white;
    }
    video {
      width: 320px;
    }
  `;
__decorate([
    property({ type: Number })
], TimedTextPlayer.prototype, "width", void 0);
__decorate([
    property({ type: Number })
], TimedTextPlayer.prototype, "height", void 0);
__decorate([
    state()
], TimedTextPlayer.prototype, "time", void 0);
__decorate([
    state()
], TimedTextPlayer.prototype, "playing", void 0);
__decorate([
    state()
], TimedTextPlayer.prototype, "_duration", void 0);
__decorate([
    state()
], TimedTextPlayer.prototype, "track", void 0);
__decorate([
    queryAll('*[data-t]') // TODO make it work with all players?
], TimedTextPlayer.prototype, "_players", void 0);
__decorate([
    property({ type: String, attribute: 'pause-mutation-observer' })
], TimedTextPlayer.prototype, "pauseMutationObserver", void 0);
__decorate([
    property({ type: String, attribute: 'player' })
], TimedTextPlayer.prototype, "playerTemplateSelector", void 0);
__decorate([
    property({ type: String, attribute: 'transcript' })
], TimedTextPlayer.prototype, "transcriptTemplateSelector", void 0);
__decorate([
    state()
], TimedTextPlayer.prototype, "_clip", void 0);
TimedTextPlayer = __decorate([
    customElement('timedtext-player')
], TimedTextPlayer);
export { TimedTextPlayer };
// TODO move
// const groupBy = <T>(array: Array<T>, property: (x: T) => string): { [key: string]: Array<T> } =>
//   array.reduce((memo: { [key: string]: Array<T> }, x: T) => {
//     if (!memo[property(x)]) {
//       memo[property(x)] = [];
//     }
//     memo[property(x)].push(x);
//     return memo;
//   }, {});
//# sourceMappingURL=timedtext-player.js.map