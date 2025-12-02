/**
* @vue/shared v3.5.25
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/* @__NO_SIDE_EFFECTS__ */
function makeMap(e) {
	let t = /* @__PURE__ */ Object.create(null);
	for (let n of e.split(",")) t[n] = 1;
	return (e) => e in t;
}
var EMPTY_OBJ = {}, EMPTY_ARR = [], NOOP = () => {}, NO = () => !1, isOn = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && (e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), isModelListener = (e) => e.startsWith("onUpdate:"), extend = Object.assign, remove = (e, t) => {
	let n = e.indexOf(t);
	n > -1 && e.splice(n, 1);
}, hasOwnProperty$1 = Object.prototype.hasOwnProperty, hasOwn$1 = (e, t) => hasOwnProperty$1.call(e, t), isArray = Array.isArray, isMap = (e) => toTypeString(e) === "[object Map]", isSet = (e) => toTypeString(e) === "[object Set]", isFunction = (e) => typeof e == "function", isString = (e) => typeof e == "string", isSymbol = (e) => typeof e == "symbol", isObject$1 = (e) => typeof e == "object" && !!e, isPromise = (e) => (isObject$1(e) || isFunction(e)) && isFunction(e.then) && isFunction(e.catch), objectToString = Object.prototype.toString, toTypeString = (e) => objectToString.call(e), toRawType = (e) => toTypeString(e).slice(8, -1), isPlainObject$1 = (e) => toTypeString(e) === "[object Object]", isIntegerKey = (e) => isString(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, isReservedProp = /* @__PURE__ */ makeMap(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"), cacheStringFunction$1 = (e) => {
	let t = /* @__PURE__ */ Object.create(null);
	return ((n) => t[n] || (t[n] = e(n)));
}, camelizeRE$1 = /-\w/g, camelize$1 = cacheStringFunction$1((e) => e.replace(camelizeRE$1, (e) => e.slice(1).toUpperCase())), hyphenateRE$1 = /\B([A-Z])/g, hyphenate$1 = cacheStringFunction$1((e) => e.replace(hyphenateRE$1, "-$1").toLowerCase()), capitalize = cacheStringFunction$1((e) => e.charAt(0).toUpperCase() + e.slice(1)), toHandlerKey = cacheStringFunction$1((e) => e ? `on${capitalize(e)}` : ""), hasChanged = (e, t) => !Object.is(e, t), invokeArrayFns = (e, ...t) => {
	for (let n = 0; n < e.length; n++) e[n](...t);
}, def = (e, t, n, r = !1) => {
	Object.defineProperty(e, t, {
		configurable: !0,
		enumerable: !1,
		writable: r,
		value: n
	});
}, looseToNumber = (e) => {
	let t = parseFloat(e);
	return isNaN(t) ? e : t;
}, toNumber = (e) => {
	let t = isString(e) ? Number(e) : NaN;
	return isNaN(t) ? e : t;
}, _globalThis, getGlobalThis = () => _globalThis ||= typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
function normalizeStyle(e) {
	if (isArray(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) {
			let r = e[n], i = isString(r) ? parseStringStyle(r) : normalizeStyle(r);
			if (i) for (let e in i) t[e] = i[e];
		}
		return t;
	} else if (isString(e) || isObject$1(e)) return e;
}
var listDelimiterRE = /;(?![^(]*\))/g, propertyDelimiterRE = /:([^]+)/, styleCommentRE = /\/\*[^]*?\*\//g;
function parseStringStyle(e) {
	let t = {};
	return e.replace(styleCommentRE, "").split(listDelimiterRE).forEach((e) => {
		if (e) {
			let n = e.split(propertyDelimiterRE);
			n.length > 1 && (t[n[0].trim()] = n[1].trim());
		}
	}), t;
}
function normalizeClass(e) {
	let t = "";
	if (isString(e)) t = e;
	else if (isArray(e)) for (let n = 0; n < e.length; n++) {
		let r = normalizeClass(e[n]);
		r && (t += r + " ");
	}
	else if (isObject$1(e)) for (let n in e) e[n] && (t += n + " ");
	return t.trim();
}
var specialBooleanAttrs = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
specialBooleanAttrs + "";
function includeBooleanAttr(e) {
	return !!e || e === "";
}
var isRef$1 = (e) => !!(e && e.__v_isRef === !0), toDisplayString = (e) => isString(e) ? e : e == null ? "" : isArray(e) || isObject$1(e) && (e.toString === objectToString || !isFunction(e.toString)) ? isRef$1(e) ? toDisplayString(e.value) : JSON.stringify(e, replacer, 2) : String(e), replacer = (e, t) => isRef$1(t) ? replacer(e, t.value) : isMap(t) ? { [`Map(${t.size})`]: [...t.entries()].reduce((e, [t, n], r) => (e[stringifySymbol(t, r) + " =>"] = n, e), {}) } : isSet(t) ? { [`Set(${t.size})`]: [...t.values()].map((e) => stringifySymbol(e)) } : isSymbol(t) ? stringifySymbol(t) : isObject$1(t) && !isArray(t) && !isPlainObject$1(t) ? String(t) : t, stringifySymbol = (e, t = "") => isSymbol(e) ? `Symbol(${e.description ?? t})` : e;
function normalizeCssVarValue(e) {
	return e == null ? "initial" : typeof e == "string" ? e === "" ? " " : e : String(e);
}
/**
* @vue/reactivity v3.5.25
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
var activeEffectScope, EffectScope = class {
	constructor(e = !1) {
		this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = activeEffectScope, !e && activeEffectScope && (this.index = (activeEffectScope.scopes ||= []).push(this) - 1);
	}
	get active() {
		return this._active;
	}
	pause() {
		if (this._active) {
			this._isPaused = !0;
			let e, t;
			if (this.scopes) for (e = 0, t = this.scopes.length; e < t; e++) this.scopes[e].pause();
			for (e = 0, t = this.effects.length; e < t; e++) this.effects[e].pause();
		}
	}
	resume() {
		if (this._active && this._isPaused) {
			this._isPaused = !1;
			let e, t;
			if (this.scopes) for (e = 0, t = this.scopes.length; e < t; e++) this.scopes[e].resume();
			for (e = 0, t = this.effects.length; e < t; e++) this.effects[e].resume();
		}
	}
	run(e) {
		if (this._active) {
			let t = activeEffectScope;
			try {
				return activeEffectScope = this, e();
			} finally {
				activeEffectScope = t;
			}
		}
	}
	on() {
		++this._on === 1 && (this.prevScope = activeEffectScope, activeEffectScope = this);
	}
	off() {
		this._on > 0 && --this._on === 0 && (activeEffectScope = this.prevScope, this.prevScope = void 0);
	}
	stop(e) {
		if (this._active) {
			this._active = !1;
			let t, n;
			for (t = 0, n = this.effects.length; t < n; t++) this.effects[t].stop();
			for (this.effects.length = 0, t = 0, n = this.cleanups.length; t < n; t++) this.cleanups[t]();
			if (this.cleanups.length = 0, this.scopes) {
				for (t = 0, n = this.scopes.length; t < n; t++) this.scopes[t].stop(!0);
				this.scopes.length = 0;
			}
			if (!this.detached && this.parent && !e) {
				let e = this.parent.scopes.pop();
				e && e !== this && (this.parent.scopes[this.index] = e, e.index = this.index);
			}
			this.parent = void 0;
		}
	}
};
function effectScope(e) {
	return new EffectScope(e);
}
function getCurrentScope() {
	return activeEffectScope;
}
function onScopeDispose(e, t = !1) {
	activeEffectScope && activeEffectScope.cleanups.push(e);
}
var activeSub, pausedQueueEffects = /* @__PURE__ */ new WeakSet(), ReactiveEffect = class {
	constructor(e) {
		this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, activeEffectScope && activeEffectScope.active && activeEffectScope.effects.push(this);
	}
	pause() {
		this.flags |= 64;
	}
	resume() {
		this.flags & 64 && (this.flags &= -65, pausedQueueEffects.has(this) && (pausedQueueEffects.delete(this), this.trigger()));
	}
	notify() {
		this.flags & 2 && !(this.flags & 32) || this.flags & 8 || batch(this);
	}
	run() {
		if (!(this.flags & 1)) return this.fn();
		this.flags |= 2, cleanupEffect(this), prepareDeps(this);
		let e = activeSub, t = shouldTrack;
		activeSub = this, shouldTrack = !0;
		try {
			return this.fn();
		} finally {
			cleanupDeps(this), activeSub = e, shouldTrack = t, this.flags &= -3;
		}
	}
	stop() {
		if (this.flags & 1) {
			for (let e = this.deps; e; e = e.nextDep) removeSub(e);
			this.deps = this.depsTail = void 0, cleanupEffect(this), this.onStop && this.onStop(), this.flags &= -2;
		}
	}
	trigger() {
		this.flags & 64 ? pausedQueueEffects.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
	}
	runIfDirty() {
		isDirty(this) && this.run();
	}
	get dirty() {
		return isDirty(this);
	}
}, batchDepth = 0, batchedSub, batchedComputed;
function batch(e, t = !1) {
	if (e.flags |= 8, t) {
		e.next = batchedComputed, batchedComputed = e;
		return;
	}
	e.next = batchedSub, batchedSub = e;
}
function startBatch() {
	batchDepth++;
}
function endBatch() {
	if (--batchDepth > 0) return;
	if (batchedComputed) {
		let e = batchedComputed;
		for (batchedComputed = void 0; e;) {
			let t = e.next;
			e.next = void 0, e.flags &= -9, e = t;
		}
	}
	let e;
	for (; batchedSub;) {
		let t = batchedSub;
		for (batchedSub = void 0; t;) {
			let n = t.next;
			if (t.next = void 0, t.flags &= -9, t.flags & 1) try {
				t.trigger();
			} catch (t) {
				e ||= t;
			}
			t = n;
		}
	}
	if (e) throw e;
}
function prepareDeps(e) {
	for (let t = e.deps; t; t = t.nextDep) t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function cleanupDeps(e) {
	let t, n = e.depsTail, r = n;
	for (; r;) {
		let e = r.prevDep;
		r.version === -1 ? (r === n && (n = e), removeSub(r), removeDep(r)) : t = r, r.dep.activeLink = r.prevActiveLink, r.prevActiveLink = void 0, r = e;
	}
	e.deps = t, e.depsTail = n;
}
function isDirty(e) {
	for (let t = e.deps; t; t = t.nextDep) if (t.dep.version !== t.version || t.dep.computed && (refreshComputed(t.dep.computed) || t.dep.version !== t.version)) return !0;
	return !!e._dirty;
}
function refreshComputed(e) {
	if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === globalVersion) || (e.globalVersion = globalVersion, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !isDirty(e)))) return;
	e.flags |= 2;
	let t = e.dep, n = activeSub, r = shouldTrack;
	activeSub = e, shouldTrack = !0;
	try {
		prepareDeps(e);
		let n = e.fn(e._value);
		(t.version === 0 || hasChanged(n, e._value)) && (e.flags |= 128, e._value = n, t.version++);
	} catch (e) {
		throw t.version++, e;
	} finally {
		activeSub = n, shouldTrack = r, cleanupDeps(e), e.flags &= -3;
	}
}
function removeSub(e, t = !1) {
	let { dep: n, prevSub: r, nextSub: i } = e;
	if (r && (r.nextSub = i, e.prevSub = void 0), i && (i.prevSub = r, e.nextSub = void 0), n.subs === e && (n.subs = r, !r && n.computed)) {
		n.computed.flags &= -5;
		for (let e = n.computed.deps; e; e = e.nextDep) removeSub(e, !0);
	}
	!t && !--n.sc && n.map && n.map.delete(n.key);
}
function removeDep(e) {
	let { prevDep: t, nextDep: n } = e;
	t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
var shouldTrack = !0, trackStack = [];
function pauseTracking() {
	trackStack.push(shouldTrack), shouldTrack = !1;
}
function resetTracking() {
	let e = trackStack.pop();
	shouldTrack = e === void 0 ? !0 : e;
}
function cleanupEffect(e) {
	let { cleanup: t } = e;
	if (e.cleanup = void 0, t) {
		let e = activeSub;
		activeSub = void 0;
		try {
			t();
		} finally {
			activeSub = e;
		}
	}
}
var globalVersion = 0, Link = class {
	constructor(e, t) {
		this.sub = e, this.dep = t, this.version = t.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
	}
}, Dep = class {
	constructor(e) {
		this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
	}
	track(e) {
		if (!activeSub || !shouldTrack || activeSub === this.computed) return;
		let t = this.activeLink;
		if (t === void 0 || t.sub !== activeSub) t = this.activeLink = new Link(activeSub, this), activeSub.deps ? (t.prevDep = activeSub.depsTail, activeSub.depsTail.nextDep = t, activeSub.depsTail = t) : activeSub.deps = activeSub.depsTail = t, addSub(t);
		else if (t.version === -1 && (t.version = this.version, t.nextDep)) {
			let e = t.nextDep;
			e.prevDep = t.prevDep, t.prevDep && (t.prevDep.nextDep = e), t.prevDep = activeSub.depsTail, t.nextDep = void 0, activeSub.depsTail.nextDep = t, activeSub.depsTail = t, activeSub.deps === t && (activeSub.deps = e);
		}
		return t;
	}
	trigger(e) {
		this.version++, globalVersion++, this.notify(e);
	}
	notify(e) {
		startBatch();
		try {
			for (let e = this.subs; e; e = e.prevSub) e.sub.notify() && e.sub.dep.notify();
		} finally {
			endBatch();
		}
	}
};
function addSub(e) {
	if (e.dep.sc++, e.sub.flags & 4) {
		let t = e.dep.computed;
		if (t && !e.dep.subs) {
			t.flags |= 20;
			for (let e = t.deps; e; e = e.nextDep) addSub(e);
		}
		let n = e.dep.subs;
		n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
	}
}
var targetMap = /* @__PURE__ */ new WeakMap(), ITERATE_KEY = Symbol(""), MAP_KEY_ITERATE_KEY = Symbol(""), ARRAY_ITERATE_KEY = Symbol("");
function track(e, t, n) {
	if (shouldTrack && activeSub) {
		let t = targetMap.get(e);
		t || targetMap.set(e, t = /* @__PURE__ */ new Map());
		let r = t.get(n);
		r || (t.set(n, r = new Dep()), r.map = t, r.key = n), r.track();
	}
}
function trigger(e, t, n, r, i, a) {
	let o = targetMap.get(e);
	if (!o) {
		globalVersion++;
		return;
	}
	let s = (e) => {
		e && e.trigger();
	};
	if (startBatch(), t === "clear") o.forEach(s);
	else {
		let i = isArray(e), a = i && isIntegerKey(n);
		if (i && n === "length") {
			let e = Number(r);
			o.forEach((t, n) => {
				(n === "length" || n === ARRAY_ITERATE_KEY || !isSymbol(n) && n >= e) && s(t);
			});
		} else switch ((n !== void 0 || o.has(void 0)) && s(o.get(n)), a && s(o.get(ARRAY_ITERATE_KEY)), t) {
			case "add":
				i ? a && s(o.get("length")) : (s(o.get(ITERATE_KEY)), isMap(e) && s(o.get(MAP_KEY_ITERATE_KEY)));
				break;
			case "delete":
				i || (s(o.get(ITERATE_KEY)), isMap(e) && s(o.get(MAP_KEY_ITERATE_KEY)));
				break;
			case "set":
				isMap(e) && s(o.get(ITERATE_KEY));
				break;
		}
	}
	endBatch();
}
function getDepFromReactive(e, t) {
	let n = targetMap.get(e);
	return n && n.get(t);
}
function reactiveReadArray(e) {
	let t = toRaw(e);
	return t === e ? t : (track(t, "iterate", ARRAY_ITERATE_KEY), isShallow(e) ? t : t.map(toReactive));
}
function shallowReadArray(e) {
	return track(e = toRaw(e), "iterate", ARRAY_ITERATE_KEY), e;
}
function toWrapped(e, t) {
	return isReadonly(e) ? isReactive(e) ? toReadonly(toReactive(t)) : toReadonly(t) : toReactive(t);
}
var arrayInstrumentations = {
	__proto__: null,
	[Symbol.iterator]() {
		return iterator(this, Symbol.iterator, (e) => toWrapped(this, e));
	},
	concat(...e) {
		return reactiveReadArray(this).concat(...e.map((e) => isArray(e) ? reactiveReadArray(e) : e));
	},
	entries() {
		return iterator(this, "entries", (e) => (e[1] = toWrapped(this, e[1]), e));
	},
	every(e, t) {
		return apply(this, "every", e, t, void 0, arguments);
	},
	filter(e, t) {
		return apply(this, "filter", e, t, (e) => e.map((e) => toWrapped(this, e)), arguments);
	},
	find(e, t) {
		return apply(this, "find", e, t, (e) => toWrapped(this, e), arguments);
	},
	findIndex(e, t) {
		return apply(this, "findIndex", e, t, void 0, arguments);
	},
	findLast(e, t) {
		return apply(this, "findLast", e, t, (e) => toWrapped(this, e), arguments);
	},
	findLastIndex(e, t) {
		return apply(this, "findLastIndex", e, t, void 0, arguments);
	},
	forEach(e, t) {
		return apply(this, "forEach", e, t, void 0, arguments);
	},
	includes(...e) {
		return searchProxy(this, "includes", e);
	},
	indexOf(...e) {
		return searchProxy(this, "indexOf", e);
	},
	join(e) {
		return reactiveReadArray(this).join(e);
	},
	lastIndexOf(...e) {
		return searchProxy(this, "lastIndexOf", e);
	},
	map(e, t) {
		return apply(this, "map", e, t, void 0, arguments);
	},
	pop() {
		return noTracking(this, "pop");
	},
	push(...e) {
		return noTracking(this, "push", e);
	},
	reduce(e, ...t) {
		return reduce(this, "reduce", e, t);
	},
	reduceRight(e, ...t) {
		return reduce(this, "reduceRight", e, t);
	},
	shift() {
		return noTracking(this, "shift");
	},
	some(e, t) {
		return apply(this, "some", e, t, void 0, arguments);
	},
	splice(...e) {
		return noTracking(this, "splice", e);
	},
	toReversed() {
		return reactiveReadArray(this).toReversed();
	},
	toSorted(e) {
		return reactiveReadArray(this).toSorted(e);
	},
	toSpliced(...e) {
		return reactiveReadArray(this).toSpliced(...e);
	},
	unshift(...e) {
		return noTracking(this, "unshift", e);
	},
	values() {
		return iterator(this, "values", (e) => toWrapped(this, e));
	}
};
function iterator(e, t, n) {
	let r = shallowReadArray(e), i = r[t]();
	return r !== e && !isShallow(e) && (i._next = i.next, i.next = () => {
		let e = i._next();
		return e.done || (e.value = n(e.value)), e;
	}), i;
}
var arrayProto = Array.prototype;
function apply(e, t, n, r, i, a) {
	let o = shallowReadArray(e), s = o !== e && !isShallow(e), c = o[t];
	if (c !== arrayProto[t]) {
		let t = c.apply(e, a);
		return s ? toReactive(t) : t;
	}
	let l = n;
	o !== e && (s ? l = function(t, r) {
		return n.call(this, toWrapped(e, t), r, e);
	} : n.length > 2 && (l = function(t, r) {
		return n.call(this, t, r, e);
	}));
	let u = c.call(o, l, r);
	return s && i ? i(u) : u;
}
function reduce(e, t, n, r) {
	let i = shallowReadArray(e), a = n;
	return i !== e && (isShallow(e) ? n.length > 3 && (a = function(t, r, i) {
		return n.call(this, t, r, i, e);
	}) : a = function(t, r, i) {
		return n.call(this, t, toWrapped(e, r), i, e);
	}), i[t](a, ...r);
}
function searchProxy(e, t, n) {
	let r = toRaw(e);
	track(r, "iterate", ARRAY_ITERATE_KEY);
	let i = r[t](...n);
	return (i === -1 || i === !1) && isProxy(n[0]) ? (n[0] = toRaw(n[0]), r[t](...n)) : i;
}
function noTracking(e, t, n = []) {
	pauseTracking(), startBatch();
	let r = toRaw(e)[t].apply(e, n);
	return endBatch(), resetTracking(), r;
}
var isNonTrackableKeys = /* @__PURE__ */ makeMap("__proto__,__v_isRef,__isVue"), builtInSymbols = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(isSymbol));
function hasOwnProperty(e) {
	isSymbol(e) || (e = String(e));
	let t = toRaw(this);
	return track(t, "has", e), t.hasOwnProperty(e);
}
var BaseReactiveHandler = class {
	constructor(e = !1, t = !1) {
		this._isReadonly = e, this._isShallow = t;
	}
	get(e, t, n) {
		if (t === "__v_skip") return e.__v_skip;
		let r = this._isReadonly, i = this._isShallow;
		if (t === "__v_isReactive") return !r;
		if (t === "__v_isReadonly") return r;
		if (t === "__v_isShallow") return i;
		if (t === "__v_raw") return n === (r ? i ? shallowReadonlyMap : readonlyMap : i ? shallowReactiveMap : reactiveMap).get(e) || Object.getPrototypeOf(e) === Object.getPrototypeOf(n) ? e : void 0;
		let a = isArray(e);
		if (!r) {
			let e;
			if (a && (e = arrayInstrumentations[t])) return e;
			if (t === "hasOwnProperty") return hasOwnProperty;
		}
		let o = Reflect.get(e, t, isRef(e) ? e : n);
		if ((isSymbol(t) ? builtInSymbols.has(t) : isNonTrackableKeys(t)) || (r || track(e, "get", t), i)) return o;
		if (isRef(o)) {
			let e = a && isIntegerKey(t) ? o : o.value;
			return r && isObject$1(e) ? readonly(e) : e;
		}
		return isObject$1(o) ? r ? readonly(o) : reactive(o) : o;
	}
}, MutableReactiveHandler = class extends BaseReactiveHandler {
	constructor(e = !1) {
		super(!1, e);
	}
	set(e, t, n, r) {
		let i = e[t], a = isArray(e) && isIntegerKey(t);
		if (!this._isShallow) {
			let e = isReadonly(i);
			if (!isShallow(n) && !isReadonly(n) && (i = toRaw(i), n = toRaw(n)), !a && isRef(i) && !isRef(n)) return e || (i.value = n), !0;
		}
		let o = a ? Number(t) < e.length : hasOwn$1(e, t), s = Reflect.set(e, t, n, isRef(e) ? e : r);
		return e === toRaw(r) && (o ? hasChanged(n, i) && trigger(e, "set", t, n, i) : trigger(e, "add", t, n)), s;
	}
	deleteProperty(e, t) {
		let n = hasOwn$1(e, t), r = e[t], i = Reflect.deleteProperty(e, t);
		return i && n && trigger(e, "delete", t, void 0, r), i;
	}
	has(e, t) {
		let n = Reflect.has(e, t);
		return (!isSymbol(t) || !builtInSymbols.has(t)) && track(e, "has", t), n;
	}
	ownKeys(e) {
		return track(e, "iterate", isArray(e) ? "length" : ITERATE_KEY), Reflect.ownKeys(e);
	}
}, ReadonlyReactiveHandler = class extends BaseReactiveHandler {
	constructor(e = !1) {
		super(!0, e);
	}
	set(e, t) {
		return !0;
	}
	deleteProperty(e, t) {
		return !0;
	}
}, mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler(), readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler(), shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(!0), shallowReadonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler(!0), toShallow = (e) => e, getProto = (e) => Reflect.getPrototypeOf(e);
function createIterableMethod(e, t, n) {
	return function(...r) {
		let i = this.__v_raw, a = toRaw(i), o = isMap(a), s = e === "entries" || e === Symbol.iterator && o, c = e === "keys" && o, l = i[e](...r), u = n ? toShallow : t ? toReadonly : toReactive;
		return !t && track(a, "iterate", c ? MAP_KEY_ITERATE_KEY : ITERATE_KEY), {
			next() {
				let { value: e, done: t } = l.next();
				return t ? {
					value: e,
					done: t
				} : {
					value: s ? [u(e[0]), u(e[1])] : u(e),
					done: t
				};
			},
			[Symbol.iterator]() {
				return this;
			}
		};
	};
}
function createReadonlyMethod(e) {
	return function(...t) {
		return e === "delete" ? !1 : e === "clear" ? void 0 : this;
	};
}
function createInstrumentations(e, t) {
	let n = {
		get(n) {
			let r = this.__v_raw, i = toRaw(r), a = toRaw(n);
			e || (hasChanged(n, a) && track(i, "get", n), track(i, "get", a));
			let { has: o } = getProto(i), s = t ? toShallow : e ? toReadonly : toReactive;
			if (o.call(i, n)) return s(r.get(n));
			if (o.call(i, a)) return s(r.get(a));
			r !== i && r.get(n);
		},
		get size() {
			let t = this.__v_raw;
			return !e && track(toRaw(t), "iterate", ITERATE_KEY), t.size;
		},
		has(t) {
			let n = this.__v_raw, r = toRaw(n), i = toRaw(t);
			return e || (hasChanged(t, i) && track(r, "has", t), track(r, "has", i)), t === i ? n.has(t) : n.has(t) || n.has(i);
		},
		forEach(n, r) {
			let i = this, a = i.__v_raw, o = toRaw(a), s = t ? toShallow : e ? toReadonly : toReactive;
			return !e && track(o, "iterate", ITERATE_KEY), a.forEach((e, t) => n.call(r, s(e), s(t), i));
		}
	};
	return extend(n, e ? {
		add: createReadonlyMethod("add"),
		set: createReadonlyMethod("set"),
		delete: createReadonlyMethod("delete"),
		clear: createReadonlyMethod("clear")
	} : {
		add(e) {
			!t && !isShallow(e) && !isReadonly(e) && (e = toRaw(e));
			let n = toRaw(this);
			return getProto(n).has.call(n, e) || (n.add(e), trigger(n, "add", e, e)), this;
		},
		set(e, n) {
			!t && !isShallow(n) && !isReadonly(n) && (n = toRaw(n));
			let r = toRaw(this), { has: i, get: a } = getProto(r), o = i.call(r, e);
			o ||= (e = toRaw(e), i.call(r, e));
			let s = a.call(r, e);
			return r.set(e, n), o ? hasChanged(n, s) && trigger(r, "set", e, n, s) : trigger(r, "add", e, n), this;
		},
		delete(e) {
			let t = toRaw(this), { has: n, get: r } = getProto(t), i = n.call(t, e);
			i ||= (e = toRaw(e), n.call(t, e));
			let a = r ? r.call(t, e) : void 0, o = t.delete(e);
			return i && trigger(t, "delete", e, void 0, a), o;
		},
		clear() {
			let e = toRaw(this), t = e.size !== 0, n = e.clear();
			return t && trigger(e, "clear", void 0, void 0, void 0), n;
		}
	}), [
		"keys",
		"values",
		"entries",
		Symbol.iterator
	].forEach((r) => {
		n[r] = createIterableMethod(r, e, t);
	}), n;
}
function createInstrumentationGetter(e, t) {
	let n = createInstrumentations(e, t);
	return (t, r, i) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? t : Reflect.get(hasOwn$1(n, r) && r in t ? n : t, r, i);
}
var mutableCollectionHandlers = { get: /* @__PURE__ */ createInstrumentationGetter(!1, !1) }, shallowCollectionHandlers = { get: /* @__PURE__ */ createInstrumentationGetter(!1, !0) }, readonlyCollectionHandlers = { get: /* @__PURE__ */ createInstrumentationGetter(!0, !1) }, shallowReadonlyCollectionHandlers = { get: /* @__PURE__ */ createInstrumentationGetter(!0, !0) }, reactiveMap = /* @__PURE__ */ new WeakMap(), shallowReactiveMap = /* @__PURE__ */ new WeakMap(), readonlyMap = /* @__PURE__ */ new WeakMap(), shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(e) {
	switch (e) {
		case "Object":
		case "Array": return 1;
		case "Map":
		case "Set":
		case "WeakMap":
		case "WeakSet": return 2;
		default: return 0;
	}
}
function getTargetType(e) {
	return e.__v_skip || !Object.isExtensible(e) ? 0 : targetTypeMap(toRawType(e));
}
function reactive(e) {
	return isReadonly(e) ? e : createReactiveObject(e, !1, mutableHandlers, mutableCollectionHandlers, reactiveMap);
}
function shallowReactive(e) {
	return createReactiveObject(e, !1, shallowReactiveHandlers, shallowCollectionHandlers, shallowReactiveMap);
}
function readonly(e) {
	return createReactiveObject(e, !0, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
}
function shallowReadonly(e) {
	return createReactiveObject(e, !0, shallowReadonlyHandlers, shallowReadonlyCollectionHandlers, shallowReadonlyMap);
}
function createReactiveObject(e, t, n, r, i) {
	if (!isObject$1(e) || e.__v_raw && !(t && e.__v_isReactive)) return e;
	let a = getTargetType(e);
	if (a === 0) return e;
	let o = i.get(e);
	if (o) return o;
	let s = new Proxy(e, a === 2 ? r : n);
	return i.set(e, s), s;
}
function isReactive(e) {
	return isReadonly(e) ? isReactive(e.__v_raw) : !!(e && e.__v_isReactive);
}
function isReadonly(e) {
	return !!(e && e.__v_isReadonly);
}
function isShallow(e) {
	return !!(e && e.__v_isShallow);
}
function isProxy(e) {
	return e ? !!e.__v_raw : !1;
}
function toRaw(e) {
	let t = e && e.__v_raw;
	return t ? toRaw(t) : e;
}
function markRaw(e) {
	return !hasOwn$1(e, "__v_skip") && Object.isExtensible(e) && def(e, "__v_skip", !0), e;
}
var toReactive = (e) => isObject$1(e) ? reactive(e) : e, toReadonly = (e) => isObject$1(e) ? readonly(e) : e;
function isRef(e) {
	return e ? e.__v_isRef === !0 : !1;
}
function ref(e) {
	return createRef$1(e, !1);
}
function shallowRef(e) {
	return createRef$1(e, !0);
}
function createRef$1(e, t) {
	return isRef(e) ? e : new RefImpl(e, t);
}
var RefImpl = class {
	constructor(e, t) {
		this.dep = new Dep(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = t ? e : toRaw(e), this._value = t ? e : toReactive(e), this.__v_isShallow = t;
	}
	get value() {
		return this.dep.track(), this._value;
	}
	set value(e) {
		let t = this._rawValue, n = this.__v_isShallow || isShallow(e) || isReadonly(e);
		e = n ? e : toRaw(e), hasChanged(e, t) && (this._rawValue = e, this._value = n ? e : toReactive(e), this.dep.trigger());
	}
};
function unref(e) {
	return isRef(e) ? e.value : e;
}
function toValue(e) {
	return isFunction(e) ? e() : unref(e);
}
var shallowUnwrapHandlers = {
	get: (e, t, n) => t === "__v_raw" ? e : unref(Reflect.get(e, t, n)),
	set: (e, t, n, r) => {
		let i = e[t];
		return isRef(i) && !isRef(n) ? (i.value = n, !0) : Reflect.set(e, t, n, r);
	}
};
function proxyRefs(e) {
	return isReactive(e) ? e : new Proxy(e, shallowUnwrapHandlers);
}
var CustomRefImpl = class {
	constructor(e) {
		this.__v_isRef = !0, this._value = void 0;
		let t = this.dep = new Dep(), { get: n, set: r } = e(t.track.bind(t), t.trigger.bind(t));
		this._get = n, this._set = r;
	}
	get value() {
		return this._value = this._get();
	}
	set value(e) {
		this._set(e);
	}
};
function customRef(e) {
	return new CustomRefImpl(e);
}
function toRefs$1(e) {
	let t = isArray(e) ? Array(e.length) : {};
	for (let n in e) t[n] = propertyToRef(e, n);
	return t;
}
var ObjectRefImpl = class {
	constructor(e, t, n) {
		this._object = e, this._key = t, this._defaultValue = n, this.__v_isRef = !0, this._value = void 0, this._raw = toRaw(e);
		let r = !0, i = e;
		if (!isArray(e) || !isIntegerKey(String(t))) do
			r = !isProxy(i) || isShallow(i);
		while (r && (i = i.__v_raw));
		this._shallow = r;
	}
	get value() {
		let e = this._object[this._key];
		return this._shallow && (e = unref(e)), this._value = e === void 0 ? this._defaultValue : e;
	}
	set value(e) {
		if (this._shallow && isRef(this._raw[this._key])) {
			let t = this._object[this._key];
			if (isRef(t)) {
				t.value = e;
				return;
			}
		}
		this._object[this._key] = e;
	}
	get dep() {
		return getDepFromReactive(this._raw, this._key);
	}
}, GetterRefImpl = class {
	constructor(e) {
		this._getter = e, this.__v_isRef = !0, this.__v_isReadonly = !0, this._value = void 0;
	}
	get value() {
		return this._value = this._getter();
	}
};
function toRef$1(e, t, n) {
	return isRef(e) ? e : isFunction(e) ? new GetterRefImpl(e) : isObject$1(e) && arguments.length > 1 ? propertyToRef(e, t, n) : ref(e);
}
function propertyToRef(e, t, n) {
	return new ObjectRefImpl(e, t, n);
}
var ComputedRefImpl = class {
	constructor(e, t, n) {
		this.fn = e, this.setter = t, this._value = void 0, this.dep = new Dep(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = globalVersion - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !t, this.isSSR = n;
	}
	notify() {
		if (this.flags |= 16, !(this.flags & 8) && activeSub !== this) return batch(this, !0), !0;
	}
	get value() {
		let e = this.dep.track();
		return refreshComputed(this), e && (e.version = this.dep.version), this._value;
	}
	set value(e) {
		this.setter && this.setter(e);
	}
};
function computed$1(e, t, n = !1) {
	let r, i;
	return isFunction(e) ? r = e : (r = e.get, i = e.set), new ComputedRefImpl(r, i, n);
}
var INITIAL_WATCHER_VALUE = {}, cleanupMap = /* @__PURE__ */ new WeakMap(), activeWatcher = void 0;
function onWatcherCleanup(e, t = !1, n = activeWatcher) {
	if (n) {
		let t = cleanupMap.get(n);
		t || cleanupMap.set(n, t = []), t.push(e);
	}
}
function watch$1(e, n, i = EMPTY_OBJ) {
	let { immediate: a, deep: o, once: s, scheduler: l, augmentJob: u, call: f } = i, m = (e) => o ? e : isShallow(e) || o === !1 || o === 0 ? traverse(e, 1) : traverse(e), _, v, y, b, x = !1, S = !1;
	if (isRef(e) ? (v = () => e.value, x = isShallow(e)) : isReactive(e) ? (v = () => m(e), x = !0) : isArray(e) ? (S = !0, x = e.some((e) => isReactive(e) || isShallow(e)), v = () => e.map((e) => {
		if (isRef(e)) return e.value;
		if (isReactive(e)) return m(e);
		if (isFunction(e)) return f ? f(e, 2) : e();
	})) : v = isFunction(e) ? n ? f ? () => f(e, 2) : e : () => {
		if (y) {
			pauseTracking();
			try {
				y();
			} finally {
				resetTracking();
			}
		}
		let t = activeWatcher;
		activeWatcher = _;
		try {
			return f ? f(e, 3, [b]) : e(b);
		} finally {
			activeWatcher = t;
		}
	} : NOOP, n && o) {
		let e = v, t = o === !0 ? Infinity : o;
		v = () => traverse(e(), t);
	}
	let C = getCurrentScope(), w = () => {
		_.stop(), C && C.active && remove(C.effects, _);
	};
	if (s && n) {
		let e = n;
		n = (...t) => {
			e(...t), w();
		};
	}
	let T = S ? Array(e.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE, E = (e) => {
		if (!(!(_.flags & 1) || !_.dirty && !e)) if (n) {
			let e = _.run();
			if (o || x || (S ? e.some((e, t) => hasChanged(e, T[t])) : hasChanged(e, T))) {
				y && y();
				let t = activeWatcher;
				activeWatcher = _;
				try {
					let t = [
						e,
						T === INITIAL_WATCHER_VALUE ? void 0 : S && T[0] === INITIAL_WATCHER_VALUE ? [] : T,
						b
					];
					T = e, f ? f(n, 3, t) : n(...t);
				} finally {
					activeWatcher = t;
				}
			}
		} else _.run();
	};
	return u && u(E), _ = new ReactiveEffect(v), _.scheduler = l ? () => l(E, !1) : E, b = (e) => onWatcherCleanup(e, !1, _), y = _.onStop = () => {
		let e = cleanupMap.get(_);
		if (e) {
			if (f) f(e, 4);
			else for (let t of e) t();
			cleanupMap.delete(_);
		}
	}, n ? a ? E(!0) : T = _.run() : l ? l(E.bind(null, !0), !0) : _.run(), w.pause = _.pause.bind(_), w.resume = _.resume.bind(_), w.stop = w, w;
}
function traverse(e, t = Infinity, n) {
	if (t <= 0 || !isObject$1(e) || e.__v_skip || (n ||= /* @__PURE__ */ new Map(), (n.get(e) || 0) >= t)) return e;
	if (n.set(e, t), t--, isRef(e)) traverse(e.value, t, n);
	else if (isArray(e)) for (let r = 0; r < e.length; r++) traverse(e[r], t, n);
	else if (isSet(e) || isMap(e)) e.forEach((e) => {
		traverse(e, t, n);
	});
	else if (isPlainObject$1(e)) {
		for (let r in e) traverse(e[r], t, n);
		for (let r of Object.getOwnPropertySymbols(e)) Object.prototype.propertyIsEnumerable.call(e, r) && traverse(e[r], t, n);
	}
	return e;
}
/**
* @vue/runtime-core v3.5.25
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function callWithErrorHandling(e, t, n, r) {
	try {
		return r ? e(...r) : e();
	} catch (e) {
		handleError(e, t, n);
	}
}
function callWithAsyncErrorHandling(e, t, n, r) {
	if (isFunction(e)) {
		let i = callWithErrorHandling(e, t, n, r);
		return i && isPromise(i) && i.catch((e) => {
			handleError(e, t, n);
		}), i;
	}
	if (isArray(e)) {
		let i = [];
		for (let a = 0; a < e.length; a++) i.push(callWithAsyncErrorHandling(e[a], t, n, r));
		return i;
	}
}
function handleError(e, n, r, i = !0) {
	let a = n ? n.vnode : null, { errorHandler: o, throwUnhandledErrorInProduction: s } = n && n.appContext.config || EMPTY_OBJ;
	if (n) {
		let t = n.parent, i = n.proxy, a = `https://vuejs.org/error-reference/#runtime-${r}`;
		for (; t;) {
			let n = t.ec;
			if (n) {
				for (let t = 0; t < n.length; t++) if (n[t](e, i, a) === !1) return;
			}
			t = t.parent;
		}
		if (o) {
			pauseTracking(), callWithErrorHandling(o, null, 10, [
				e,
				i,
				a
			]), resetTracking();
			return;
		}
	}
	logError(e, r, a, i, s);
}
function logError(e, t, n, r = !0, i = !1) {
	if (i) throw e;
	console.error(e);
}
var queue = [], flushIndex = -1, pendingPostFlushCbs = [], activePostFlushCbs = null, postFlushIndex = 0, resolvedPromise = /* @__PURE__ */ Promise.resolve(), currentFlushPromise = null;
function nextTick(e) {
	let t = currentFlushPromise || resolvedPromise;
	return e ? t.then(this ? e.bind(this) : e) : t;
}
function findInsertionIndex(e) {
	let t = flushIndex + 1, n = queue.length;
	for (; t < n;) {
		let r = t + n >>> 1, i = queue[r], a = getId(i);
		a < e || a === e && i.flags & 2 ? t = r + 1 : n = r;
	}
	return t;
}
function queueJob(e) {
	if (!(e.flags & 1)) {
		let t = getId(e), n = queue[queue.length - 1];
		!n || !(e.flags & 2) && t >= getId(n) ? queue.push(e) : queue.splice(findInsertionIndex(t), 0, e), e.flags |= 1, queueFlush();
	}
}
function queueFlush() {
	currentFlushPromise ||= resolvedPromise.then(flushJobs);
}
function queuePostFlushCb(e) {
	isArray(e) ? pendingPostFlushCbs.push(...e) : activePostFlushCbs && e.id === -1 ? activePostFlushCbs.splice(postFlushIndex + 1, 0, e) : e.flags & 1 || (pendingPostFlushCbs.push(e), e.flags |= 1), queueFlush();
}
function flushPreFlushCbs(e, t, n = flushIndex + 1) {
	for (; n < queue.length; n++) {
		let t = queue[n];
		if (t && t.flags & 2) {
			if (e && t.id !== e.uid) continue;
			queue.splice(n, 1), n--, t.flags & 4 && (t.flags &= -2), t(), t.flags & 4 || (t.flags &= -2);
		}
	}
}
function flushPostFlushCbs(e) {
	if (pendingPostFlushCbs.length) {
		let e = [...new Set(pendingPostFlushCbs)].sort((e, t) => getId(e) - getId(t));
		if (pendingPostFlushCbs.length = 0, activePostFlushCbs) {
			activePostFlushCbs.push(...e);
			return;
		}
		for (activePostFlushCbs = e, postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
			let e = activePostFlushCbs[postFlushIndex];
			e.flags & 4 && (e.flags &= -2), e.flags & 8 || e(), e.flags &= -2;
		}
		activePostFlushCbs = null, postFlushIndex = 0;
	}
}
var getId = (e) => e.id == null ? e.flags & 2 ? -1 : Infinity : e.id;
function flushJobs(e) {
	try {
		for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
			let e = queue[flushIndex];
			e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), callWithErrorHandling(e, e.i, e.i ? 15 : 14), e.flags & 4 || (e.flags &= -2));
		}
	} finally {
		for (; flushIndex < queue.length; flushIndex++) {
			let e = queue[flushIndex];
			e && (e.flags &= -2);
		}
		flushIndex = -1, queue.length = 0, flushPostFlushCbs(e), currentFlushPromise = null, (queue.length || pendingPostFlushCbs.length) && flushJobs(e);
	}
}
var currentRenderingInstance = null, currentScopeId = null;
function setCurrentRenderingInstance(e) {
	let t = currentRenderingInstance;
	return currentRenderingInstance = e, currentScopeId = e && e.type.__scopeId || null, t;
}
function withCtx(e, t = currentRenderingInstance, n) {
	if (!t || e._n) return e;
	let r = (...n) => {
		r._d && setBlockTracking(-1);
		let i = setCurrentRenderingInstance(t), a;
		try {
			a = e(...n);
		} finally {
			setCurrentRenderingInstance(i), r._d && setBlockTracking(1);
		}
		return a;
	};
	return r._n = !0, r._c = !0, r._d = !0, r;
}
function withDirectives(e, n) {
	if (currentRenderingInstance === null) return e;
	let r = getComponentPublicInstance(currentRenderingInstance), i = e.dirs ||= [];
	for (let e = 0; e < n.length; e++) {
		let [a, o, s, c = EMPTY_OBJ] = n[e];
		a && (isFunction(a) && (a = {
			mounted: a,
			updated: a
		}), a.deep && traverse(o), i.push({
			dir: a,
			instance: r,
			value: o,
			oldValue: void 0,
			arg: s,
			modifiers: c
		}));
	}
	return e;
}
function invokeDirectiveHook(e, t, n, r) {
	let i = e.dirs, a = t && t.dirs;
	for (let o = 0; o < i.length; o++) {
		let s = i[o];
		a && (s.oldValue = a[o].value);
		let c = s.dir[r];
		c && (pauseTracking(), callWithAsyncErrorHandling(c, n, 8, [
			e.el,
			s,
			e,
			t
		]), resetTracking());
	}
}
var TeleportEndKey = Symbol("_vte"), isTeleport = (e) => e.__isTeleport, isTeleportDisabled = (e) => e && (e.disabled || e.disabled === ""), isTeleportDeferred = (e) => e && (e.defer || e.defer === ""), isTargetSVG = (e) => typeof SVGElement < "u" && e instanceof SVGElement, isTargetMathML = (e) => typeof MathMLElement == "function" && e instanceof MathMLElement, resolveTarget = (e, t) => {
	let n = e && e.to;
	return isString(n) ? t ? t(n) : null : n;
}, TeleportImpl = {
	name: "Teleport",
	__isTeleport: !0,
	process(e, t, n, r, i, a, o, s, c, l) {
		let { mc: u, pc: d, pbc: f, o: { insert: m, querySelector: g, createText: _, createComment: v } } = l, y = isTeleportDisabled(t.props), { shapeFlag: b, children: x, dynamicChildren: S } = t;
		if (e == null) {
			let e = t.el = _(""), l = t.anchor = _("");
			m(e, n, r), m(l, n, r);
			let d = (e, t) => {
				b & 16 && u(x, e, t, i, a, o, s, c);
			}, f = () => {
				let e = t.target = resolveTarget(t.props, g), n = prepareAnchor(e, t, _, m);
				e && (o !== "svg" && isTargetSVG(e) ? o = "svg" : o !== "mathml" && isTargetMathML(e) && (o = "mathml"), i && i.isCE && (i.ce._teleportTargets || (i.ce._teleportTargets = /* @__PURE__ */ new Set())).add(e), y || (d(e, n), updateCssVars(t, !1)));
			};
			y && (d(n, l), updateCssVars(t, !0)), isTeleportDeferred(t.props) ? (t.el.__isMounted = !1, queuePostRenderEffect(() => {
				f(), delete t.el.__isMounted;
			}, a)) : f();
		} else {
			if (isTeleportDeferred(t.props) && e.el.__isMounted === !1) {
				queuePostRenderEffect(() => {
					TeleportImpl.process(e, t, n, r, i, a, o, s, c, l);
				}, a);
				return;
			}
			t.el = e.el, t.targetStart = e.targetStart;
			let u = t.anchor = e.anchor, m = t.target = e.target, _ = t.targetAnchor = e.targetAnchor, v = isTeleportDisabled(e.props), b = v ? n : m, x = v ? u : _;
			if (o === "svg" || isTargetSVG(m) ? o = "svg" : (o === "mathml" || isTargetMathML(m)) && (o = "mathml"), S ? (f(e.dynamicChildren, S, b, i, a, o, s), traverseStaticChildren(e, t, !0)) : c || d(e, t, b, x, i, a, o, s, !1), y) v ? t.props && e.props && t.props.to !== e.props.to && (t.props.to = e.props.to) : moveTeleport(t, n, u, l, 1);
			else if ((t.props && t.props.to) !== (e.props && e.props.to)) {
				let e = t.target = resolveTarget(t.props, g);
				e && moveTeleport(t, e, null, l, 0);
			} else v && moveTeleport(t, m, _, l, 1);
			updateCssVars(t, y);
		}
	},
	remove(e, t, n, { um: r, o: { remove: i } }, a) {
		let { shapeFlag: o, children: s, anchor: c, targetStart: l, targetAnchor: u, target: d, props: f } = e;
		if (d && (i(l), i(u)), a && i(c), o & 16) {
			let e = a || !isTeleportDisabled(f);
			for (let i = 0; i < s.length; i++) {
				let a = s[i];
				r(a, t, n, e, !!a.dynamicChildren);
			}
		}
	},
	move: moveTeleport,
	hydrate: hydrateTeleport
};
function moveTeleport(e, t, n, { o: { insert: r }, m: i }, a = 2) {
	a === 0 && r(e.targetAnchor, t, n);
	let { el: o, anchor: s, shapeFlag: c, children: l, props: u } = e, d = a === 2;
	if (d && r(o, t, n), (!d || isTeleportDisabled(u)) && c & 16) for (let e = 0; e < l.length; e++) i(l[e], t, n, 2);
	d && r(s, t, n);
}
function hydrateTeleport(e, t, n, r, i, a, { o: { nextSibling: o, parentNode: s, querySelector: c, insert: l, createText: u } }, d) {
	function f(e, t, c, l) {
		t.anchor = d(o(e), t, s(e), n, r, i, a), t.targetStart = c, t.targetAnchor = l;
	}
	let m = t.target = resolveTarget(t.props, c), g = isTeleportDisabled(t.props);
	if (m) {
		let s = m._lpa || m.firstChild;
		if (t.shapeFlag & 16) if (g) f(e, t, s, s && o(s));
		else {
			t.anchor = o(e);
			let c = s;
			for (; c;) {
				if (c && c.nodeType === 8) {
					if (c.data === "teleport start anchor") t.targetStart = c;
					else if (c.data === "teleport anchor") {
						t.targetAnchor = c, m._lpa = t.targetAnchor && o(t.targetAnchor);
						break;
					}
				}
				c = o(c);
			}
			t.targetAnchor || prepareAnchor(m, t, u, l), d(s && o(s), t, m, n, r, i, a);
		}
		updateCssVars(t, g);
	} else g && t.shapeFlag & 16 && f(e, t, e, o(e));
	return t.anchor && o(t.anchor);
}
var Teleport = TeleportImpl;
function updateCssVars(e, t) {
	let n = e.ctx;
	if (n && n.ut) {
		let r, i;
		for (t ? (r = e.el, i = e.anchor) : (r = e.targetStart, i = e.targetAnchor); r && r !== i;) r.nodeType === 1 && r.setAttribute("data-v-owner", n.uid), r = r.nextSibling;
		n.ut();
	}
}
function prepareAnchor(e, t, n, r) {
	let i = t.targetStart = n(""), a = t.targetAnchor = n("");
	return i[TeleportEndKey] = a, e && (r(i, e), r(a, e)), a;
}
var leaveCbKey = Symbol("_leaveCb"), enterCbKey$1 = Symbol("_enterCb");
function useTransitionState() {
	let e = {
		isMounted: !1,
		isLeaving: !1,
		isUnmounting: !1,
		leavingVNodes: /* @__PURE__ */ new Map()
	};
	return onMounted(() => {
		e.isMounted = !0;
	}), onBeforeUnmount(() => {
		e.isUnmounting = !0;
	}), e;
}
var TransitionHookValidator = [Function, Array], BaseTransitionPropsValidators = {
	mode: String,
	appear: Boolean,
	persisted: Boolean,
	onBeforeEnter: TransitionHookValidator,
	onEnter: TransitionHookValidator,
	onAfterEnter: TransitionHookValidator,
	onEnterCancelled: TransitionHookValidator,
	onBeforeLeave: TransitionHookValidator,
	onLeave: TransitionHookValidator,
	onAfterLeave: TransitionHookValidator,
	onLeaveCancelled: TransitionHookValidator,
	onBeforeAppear: TransitionHookValidator,
	onAppear: TransitionHookValidator,
	onAfterAppear: TransitionHookValidator,
	onAppearCancelled: TransitionHookValidator
}, recursiveGetSubtree = (e) => {
	let t = e.subTree;
	return t.component ? recursiveGetSubtree(t.component) : t;
}, BaseTransitionImpl = {
	name: "BaseTransition",
	props: BaseTransitionPropsValidators,
	setup(e, { slots: t }) {
		let n = getCurrentInstance(), r = useTransitionState();
		return () => {
			let i = t.default && getTransitionRawChildren(t.default(), !0);
			if (!i || !i.length) return;
			let a = findNonCommentChild(i), o = toRaw(e), { mode: s } = o;
			if (r.isLeaving) return emptyPlaceholder(a);
			let c = getInnerChild$1(a);
			if (!c) return emptyPlaceholder(a);
			let l = resolveTransitionHooks(c, o, r, n, (e) => l = e);
			c.type !== Comment && setTransitionHooks(c, l);
			let u = n.subTree && getInnerChild$1(n.subTree);
			if (u && u.type !== Comment && !isSameVNodeType(u, c) && recursiveGetSubtree(n).type !== Comment) {
				let e = resolveTransitionHooks(u, o, r, n);
				if (setTransitionHooks(u, e), s === "out-in" && c.type !== Comment) return r.isLeaving = !0, e.afterLeave = () => {
					r.isLeaving = !1, n.job.flags & 8 || n.update(), delete e.afterLeave, u = void 0;
				}, emptyPlaceholder(a);
				s === "in-out" && c.type !== Comment ? e.delayLeave = (e, t, n) => {
					let i = getLeavingNodesForType(r, u);
					i[String(u.key)] = u, e[leaveCbKey] = () => {
						t(), e[leaveCbKey] = void 0, delete l.delayedLeave, u = void 0;
					}, l.delayedLeave = () => {
						n(), delete l.delayedLeave, u = void 0;
					};
				} : u = void 0;
			} else u &&= void 0;
			return a;
		};
	}
};
function findNonCommentChild(e) {
	let t = e[0];
	if (e.length > 1) {
		for (let n of e) if (n.type !== Comment) {
			t = n;
			break;
		}
	}
	return t;
}
var BaseTransition = BaseTransitionImpl;
function getLeavingNodesForType(e, t) {
	let { leavingVNodes: n } = e, r = n.get(t.type);
	return r || (r = /* @__PURE__ */ Object.create(null), n.set(t.type, r)), r;
}
function resolveTransitionHooks(e, t, n, r, i) {
	let { appear: a, mode: o, persisted: s = !1, onBeforeEnter: c, onEnter: l, onAfterEnter: u, onEnterCancelled: f, onBeforeLeave: m, onLeave: g, onAfterLeave: _, onLeaveCancelled: v, onBeforeAppear: y, onAppear: b, onAfterAppear: x, onAppearCancelled: S } = t, C = String(e.key), w = getLeavingNodesForType(n, e), T = (e, t) => {
		e && callWithAsyncErrorHandling(e, r, 9, t);
	}, E = (e, t) => {
		let n = t[1];
		T(e, t), isArray(e) ? e.every((e) => e.length <= 1) && n() : e.length <= 1 && n();
	}, D = {
		mode: o,
		persisted: s,
		beforeEnter(t) {
			let r = c;
			if (!n.isMounted) if (a) r = y || c;
			else return;
			t[leaveCbKey] && t[leaveCbKey](!0);
			let i = w[C];
			i && isSameVNodeType(e, i) && i.el[leaveCbKey] && i.el[leaveCbKey](), T(r, [t]);
		},
		enter(e) {
			let t = l, r = u, i = f;
			if (!n.isMounted) if (a) t = b || l, r = x || u, i = S || f;
			else return;
			let o = !1, s = e[enterCbKey$1] = (t) => {
				o || (o = !0, T(t ? i : r, [e]), D.delayedLeave && D.delayedLeave(), e[enterCbKey$1] = void 0);
			};
			t ? E(t, [e, s]) : s();
		},
		leave(t, r) {
			let i = String(e.key);
			if (t[enterCbKey$1] && t[enterCbKey$1](!0), n.isUnmounting) return r();
			T(m, [t]);
			let a = !1, o = t[leaveCbKey] = (n) => {
				a || (a = !0, r(), T(n ? v : _, [t]), t[leaveCbKey] = void 0, w[i] === e && delete w[i]);
			};
			w[i] = e, g ? E(g, [t, o]) : o();
		},
		clone(e) {
			let a = resolveTransitionHooks(e, t, n, r, i);
			return i && i(a), a;
		}
	};
	return D;
}
function emptyPlaceholder(e) {
	if (isKeepAlive(e)) return e = cloneVNode(e), e.children = null, e;
}
function getInnerChild$1(e) {
	if (!isKeepAlive(e)) return isTeleport(e.type) && e.children ? findNonCommentChild(e.children) : e;
	if (e.component) return e.component.subTree;
	let { shapeFlag: t, children: n } = e;
	if (n) {
		if (t & 16) return n[0];
		if (t & 32 && isFunction(n.default)) return n.default();
	}
}
function setTransitionHooks(e, t) {
	e.shapeFlag & 6 && e.component ? (e.transition = t, setTransitionHooks(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
function getTransitionRawChildren(e, t = !1, n) {
	let r = [], i = 0;
	for (let a = 0; a < e.length; a++) {
		let o = e[a], s = n == null ? o.key : String(n) + String(o.key == null ? a : o.key);
		o.type === Fragment ? (o.patchFlag & 128 && i++, r = r.concat(getTransitionRawChildren(o.children, t, s))) : (t || o.type !== Comment) && r.push(s == null ? o : cloneVNode(o, { key: s }));
	}
	if (i > 1) for (let e = 0; e < r.length; e++) r[e].patchFlag = -2;
	return r;
}
/* @__NO_SIDE_EFFECTS__ */
function defineComponent(e, t) {
	return isFunction(e) ? /* @__PURE__ */ (() => extend({ name: e.name }, t, { setup: e }))() : e;
}
function markAsyncBoundary(e) {
	e.ids = [
		e.ids[0] + e.ids[2]++ + "-",
		0,
		0
	];
}
function useTemplateRef(e) {
	let n = getCurrentInstance(), r = shallowRef(null);
	if (n) {
		let i = n.refs === EMPTY_OBJ ? n.refs = {} : n.refs;
		Object.defineProperty(i, e, {
			enumerable: !0,
			get: () => r.value,
			set: (e) => r.value = e
		});
	}
	return r;
}
var pendingSetRefMap = /* @__PURE__ */ new WeakMap();
function setRef(e, n, r, a, o = !1) {
	if (isArray(e)) {
		e.forEach((e, t) => setRef(e, n && (isArray(n) ? n[t] : n), r, a, o));
		return;
	}
	if (isAsyncWrapper(a) && !o) {
		a.shapeFlag & 512 && a.type.__asyncResolved && a.component.subTree.component && setRef(e, n, r, a.component.subTree);
		return;
	}
	let s = a.shapeFlag & 4 ? getComponentPublicInstance(a.component) : a.el, l = o ? null : s, { i: f, r: m } = e, v = n && n.r, y = f.refs === EMPTY_OBJ ? f.refs = {} : f.refs, b = f.setupState, x = toRaw(b), S = b === EMPTY_OBJ ? NO : (e) => hasOwn$1(x, e), C = (e) => !0;
	if (v != null && v !== m) {
		if (invalidatePendingSetRef(n), isString(v)) y[v] = null, S(v) && (b[v] = null);
		else if (isRef(v)) {
			C(v) && (v.value = null);
			let e = n;
			e.k && (y[e.k] = null);
		}
	}
	if (isFunction(m)) callWithErrorHandling(m, f, 12, [l, y]);
	else {
		let t = isString(m), n = isRef(m);
		if (t || n) {
			let i = () => {
				if (e.f) {
					let n = t ? S(m) ? b[m] : y[m] : C(m) || !e.k ? m.value : y[e.k];
					if (o) isArray(n) && remove(n, s);
					else if (isArray(n)) n.includes(s) || n.push(s);
					else if (t) y[m] = [s], S(m) && (b[m] = y[m]);
					else {
						let t = [s];
						C(m) && (m.value = t), e.k && (y[e.k] = t);
					}
				} else t ? (y[m] = l, S(m) && (b[m] = l)) : n && (C(m) && (m.value = l), e.k && (y[e.k] = l));
			};
			if (l) {
				let t = () => {
					i(), pendingSetRefMap.delete(e);
				};
				t.id = -1, pendingSetRefMap.set(e, t), queuePostRenderEffect(t, r);
			} else invalidatePendingSetRef(e), i();
		}
	}
}
function invalidatePendingSetRef(e) {
	let t = pendingSetRefMap.get(e);
	t && (t.flags |= 8, pendingSetRefMap.delete(e));
}
getGlobalThis().requestIdleCallback, getGlobalThis().cancelIdleCallback;
var isAsyncWrapper = (e) => !!e.type.__asyncLoader, isKeepAlive = (e) => e.type.__isKeepAlive;
function onActivated(e, t) {
	registerKeepAliveHook(e, "a", t);
}
function onDeactivated(e, t) {
	registerKeepAliveHook(e, "da", t);
}
function registerKeepAliveHook(e, t, n = currentInstance) {
	let r = e.__wdc ||= () => {
		let t = n;
		for (; t;) {
			if (t.isDeactivated) return;
			t = t.parent;
		}
		return e();
	};
	if (injectHook(t, r, n), n) {
		let e = n.parent;
		for (; e && e.parent;) isKeepAlive(e.parent.vnode) && injectToKeepAliveRoot(r, t, n, e), e = e.parent;
	}
}
function injectToKeepAliveRoot(e, t, n, r) {
	let i = injectHook(t, e, r, !0);
	onUnmounted(() => {
		remove(r[t], i);
	}, n);
}
function injectHook(e, t, n = currentInstance, r = !1) {
	if (n) {
		let i = n[e] || (n[e] = []), a = t.__weh ||= (...r) => {
			pauseTracking();
			let i = setCurrentInstance(n), a = callWithAsyncErrorHandling(t, n, e, r);
			return i(), resetTracking(), a;
		};
		return r ? i.unshift(a) : i.push(a), a;
	}
}
var createHook = (e) => (t, n = currentInstance) => {
	(!isInSSRComponentSetup || e === "sp") && injectHook(e, (...e) => t(...e), n);
}, onBeforeMount = createHook("bm"), onMounted = createHook("m"), onBeforeUpdate = createHook("bu"), onUpdated = createHook("u"), onBeforeUnmount = createHook("bum"), onUnmounted = createHook("um"), onServerPrefetch = createHook("sp"), onRenderTriggered = createHook("rtg"), onRenderTracked = createHook("rtc");
function onErrorCaptured(e, t = currentInstance) {
	injectHook("ec", e, t);
}
var NULL_DYNAMIC_COMPONENT = Symbol.for("v-ndc");
function renderList(e, t, n, r) {
	let i, a = n && n[r], o = isArray(e);
	if (o || isString(e)) {
		let n = o && isReactive(e), r = !1, s = !1;
		n && (r = !isShallow(e), s = isReadonly(e), e = shallowReadArray(e)), i = Array(e.length);
		for (let n = 0, o = e.length; n < o; n++) i[n] = t(r ? s ? toReadonly(toReactive(e[n])) : toReactive(e[n]) : e[n], n, void 0, a && a[n]);
	} else if (typeof e == "number") {
		i = Array(e);
		for (let n = 0; n < e; n++) i[n] = t(n + 1, n, void 0, a && a[n]);
	} else if (isObject$1(e)) if (e[Symbol.iterator]) i = Array.from(e, (e, n) => t(e, n, void 0, a && a[n]));
	else {
		let n = Object.keys(e);
		i = Array(n.length);
		for (let r = 0, o = n.length; r < o; r++) {
			let o = n[r];
			i[r] = t(e[o], o, r, a && a[r]);
		}
	}
	else i = [];
	return n && (n[r] = i), i;
}
var getPublicInstance = (e) => e ? isStatefulComponent(e) ? getComponentPublicInstance(e) : getPublicInstance(e.parent) : null, publicPropertiesMap = /* @__PURE__ */ extend(/* @__PURE__ */ Object.create(null), {
	$: (e) => e,
	$el: (e) => e.vnode.el,
	$data: (e) => e.data,
	$props: (e) => e.props,
	$attrs: (e) => e.attrs,
	$slots: (e) => e.slots,
	$refs: (e) => e.refs,
	$parent: (e) => getPublicInstance(e.parent),
	$root: (e) => getPublicInstance(e.root),
	$host: (e) => e.ce,
	$emit: (e) => e.emit,
	$options: (e) => resolveMergedOptions(e),
	$forceUpdate: (e) => e.f ||= () => {
		queueJob(e.update);
	},
	$nextTick: (e) => e.n ||= nextTick.bind(e.proxy),
	$watch: (e) => instanceWatch.bind(e)
}), hasSetupBinding = (e, n) => e !== EMPTY_OBJ && !e.__isScriptSetup && hasOwn$1(e, n), PublicInstanceProxyHandlers = {
	get({ _: e }, n) {
		if (n === "__v_skip") return !0;
		let { ctx: r, setupState: i, data: a, props: o, accessCache: s, type: c, appContext: l } = e;
		if (n[0] !== "$") {
			let e = s[n];
			if (e !== void 0) switch (e) {
				case 1: return i[n];
				case 2: return a[n];
				case 4: return r[n];
				case 3: return o[n];
			}
			else if (hasSetupBinding(i, n)) return s[n] = 1, i[n];
			else if (a !== EMPTY_OBJ && hasOwn$1(a, n)) return s[n] = 2, a[n];
			else if (hasOwn$1(o, n)) return s[n] = 3, o[n];
			else if (r !== EMPTY_OBJ && hasOwn$1(r, n)) return s[n] = 4, r[n];
			else shouldCacheAccess && (s[n] = 0);
		}
		let d = publicPropertiesMap[n], f, m;
		if (d) return n === "$attrs" && track(e.attrs, "get", ""), d(e);
		if ((f = c.__cssModules) && (f = f[n])) return f;
		if (r !== EMPTY_OBJ && hasOwn$1(r, n)) return s[n] = 4, r[n];
		if (m = l.config.globalProperties, hasOwn$1(m, n)) return m[n];
	},
	set({ _: e }, n, r) {
		let { data: i, setupState: a, ctx: o } = e;
		return hasSetupBinding(a, n) ? (a[n] = r, !0) : i !== EMPTY_OBJ && hasOwn$1(i, n) ? (i[n] = r, !0) : hasOwn$1(e.props, n) || n[0] === "$" && n.slice(1) in e ? !1 : (o[n] = r, !0);
	},
	has({ _: { data: e, setupState: n, accessCache: r, ctx: i, appContext: a, props: o, type: s } }, c) {
		let l;
		return !!(r[c] || e !== EMPTY_OBJ && c[0] !== "$" && hasOwn$1(e, c) || hasSetupBinding(n, c) || hasOwn$1(o, c) || hasOwn$1(i, c) || hasOwn$1(publicPropertiesMap, c) || hasOwn$1(a.config.globalProperties, c) || (l = s.__cssModules) && l[c]);
	},
	defineProperty(e, t, n) {
		return n.get == null ? hasOwn$1(n, "value") && this.set(e, t, n.value, null) : e._.accessCache[t] = 0, Reflect.defineProperty(e, t, n);
	}
};
function normalizePropsOrEmits(e) {
	return isArray(e) ? e.reduce((e, t) => (e[t] = null, e), {}) : e;
}
function withAsyncContext(e) {
	let t = getCurrentInstance(), n = e();
	return unsetCurrentInstance(), isPromise(n) && (n = n.catch((e) => {
		throw setCurrentInstance(t), e;
	})), [n, () => setCurrentInstance(t)];
}
var shouldCacheAccess = !0;
function applyOptions(e) {
	let t = resolveMergedOptions(e), n = e.proxy, i = e.ctx;
	shouldCacheAccess = !1, t.beforeCreate && callHook$1(t.beforeCreate, e, "bc");
	let { data: a, computed: o, methods: s, watch: c, provide: l, inject: u, created: f, beforeMount: m, mounted: _, beforeUpdate: v, updated: b, activated: x, deactivated: S, beforeDestroy: C, beforeUnmount: w, destroyed: T, unmounted: E, render: D, renderTracked: O, renderTriggered: k, errorCaptured: A, serverPrefetch: j, expose: M, inheritAttrs: N, components: P, directives: F, filters: I } = t;
	if (u && resolveInjections(u, i, null), s) for (let e in s) {
		let t = s[e];
		isFunction(t) && (i[e] = t.bind(n));
	}
	if (a) {
		let t = a.call(n, n);
		isObject$1(t) && (e.data = reactive(t));
	}
	if (shouldCacheAccess = !0, o) for (let e in o) {
		let t = o[e], a = computed({
			get: isFunction(t) ? t.bind(n, n) : isFunction(t.get) ? t.get.bind(n, n) : NOOP,
			set: !isFunction(t) && isFunction(t.set) ? t.set.bind(n) : NOOP
		});
		Object.defineProperty(i, e, {
			enumerable: !0,
			configurable: !0,
			get: () => a.value,
			set: (e) => a.value = e
		});
	}
	if (c) for (let e in c) createWatcher(c[e], i, n, e);
	if (l) {
		let e = isFunction(l) ? l.call(n) : l;
		Reflect.ownKeys(e).forEach((t) => {
			provide(t, e[t]);
		});
	}
	f && callHook$1(f, e, "c");
	function L(e, t) {
		isArray(t) ? t.forEach((t) => e(t.bind(n))) : t && e(t.bind(n));
	}
	if (L(onBeforeMount, m), L(onMounted, _), L(onBeforeUpdate, v), L(onUpdated, b), L(onActivated, x), L(onDeactivated, S), L(onErrorCaptured, A), L(onRenderTracked, O), L(onRenderTriggered, k), L(onBeforeUnmount, w), L(onUnmounted, E), L(onServerPrefetch, j), isArray(M)) if (M.length) {
		let t = e.exposed ||= {};
		M.forEach((e) => {
			Object.defineProperty(t, e, {
				get: () => n[e],
				set: (t) => n[e] = t,
				enumerable: !0
			});
		});
	} else e.exposed ||= {};
	D && e.render === NOOP && (e.render = D), N != null && (e.inheritAttrs = N), P && (e.components = P), F && (e.directives = F), j && markAsyncBoundary(e);
}
function resolveInjections(e, t, n = NOOP) {
	for (let n in isArray(e) && (e = normalizeInject(e)), e) {
		let r = e[n], i;
		i = isObject$1(r) ? "default" in r ? inject(r.from || n, r.default, !0) : inject(r.from || n) : inject(r), isRef(i) ? Object.defineProperty(t, n, {
			enumerable: !0,
			configurable: !0,
			get: () => i.value,
			set: (e) => i.value = e
		}) : t[n] = i;
	}
}
function callHook$1(e, t, n) {
	callWithAsyncErrorHandling(isArray(e) ? e.map((e) => e.bind(t.proxy)) : e.bind(t.proxy), t, n);
}
function createWatcher(e, t, n, r) {
	let i = r.includes(".") ? createPathGetter(n, r) : () => n[r];
	if (isString(e)) {
		let n = t[e];
		isFunction(n) && watch(i, n);
	} else if (isFunction(e)) watch(i, e.bind(n));
	else if (isObject$1(e)) if (isArray(e)) e.forEach((e) => createWatcher(e, t, n, r));
	else {
		let r = isFunction(e.handler) ? e.handler.bind(n) : t[e.handler];
		isFunction(r) && watch(i, r, e);
	}
}
function resolveMergedOptions(e) {
	let t = e.type, { mixins: n, extends: r } = t, { mixins: i, optionsCache: a, config: { optionMergeStrategies: o } } = e.appContext, s = a.get(t), c;
	return s ? c = s : !i.length && !n && !r ? c = t : (c = {}, i.length && i.forEach((e) => mergeOptions(c, e, o, !0)), mergeOptions(c, t, o)), isObject$1(t) && a.set(t, c), c;
}
function mergeOptions(e, t, n, r = !1) {
	let { mixins: i, extends: a } = t;
	for (let o in a && mergeOptions(e, a, n, !0), i && i.forEach((t) => mergeOptions(e, t, n, !0)), t) if (!(r && o === "expose")) {
		let r = internalOptionMergeStrats[o] || n && n[o];
		e[o] = r ? r(e[o], t[o]) : t[o];
	}
	return e;
}
var internalOptionMergeStrats = {
	data: mergeDataFn,
	props: mergeEmitsOrPropsOptions,
	emits: mergeEmitsOrPropsOptions,
	methods: mergeObjectOptions,
	computed: mergeObjectOptions,
	beforeCreate: mergeAsArray,
	created: mergeAsArray,
	beforeMount: mergeAsArray,
	mounted: mergeAsArray,
	beforeUpdate: mergeAsArray,
	updated: mergeAsArray,
	beforeDestroy: mergeAsArray,
	beforeUnmount: mergeAsArray,
	destroyed: mergeAsArray,
	unmounted: mergeAsArray,
	activated: mergeAsArray,
	deactivated: mergeAsArray,
	errorCaptured: mergeAsArray,
	serverPrefetch: mergeAsArray,
	components: mergeObjectOptions,
	directives: mergeObjectOptions,
	watch: mergeWatchOptions,
	provide: mergeDataFn,
	inject: mergeInject
};
function mergeDataFn(e, t) {
	return t ? e ? function() {
		return extend(isFunction(e) ? e.call(this, this) : e, isFunction(t) ? t.call(this, this) : t);
	} : t : e;
}
function mergeInject(e, t) {
	return mergeObjectOptions(normalizeInject(e), normalizeInject(t));
}
function normalizeInject(e) {
	if (isArray(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) t[e[n]] = e[n];
		return t;
	}
	return e;
}
function mergeAsArray(e, t) {
	return e ? [...new Set([].concat(e, t))] : t;
}
function mergeObjectOptions(e, t) {
	return e ? extend(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function mergeEmitsOrPropsOptions(e, t) {
	return e ? isArray(e) && isArray(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : extend(/* @__PURE__ */ Object.create(null), normalizePropsOrEmits(e), normalizePropsOrEmits(t ?? {})) : t;
}
function mergeWatchOptions(e, t) {
	if (!e) return t;
	if (!t) return e;
	let n = extend(/* @__PURE__ */ Object.create(null), e);
	for (let r in t) n[r] = mergeAsArray(e[r], t[r]);
	return n;
}
function createAppContext() {
	return {
		app: null,
		config: {
			isNativeTag: NO,
			performance: !1,
			globalProperties: {},
			optionMergeStrategies: {},
			errorHandler: void 0,
			warnHandler: void 0,
			compilerOptions: {}
		},
		mixins: [],
		components: {},
		directives: {},
		provides: /* @__PURE__ */ Object.create(null),
		optionsCache: /* @__PURE__ */ new WeakMap(),
		propsCache: /* @__PURE__ */ new WeakMap(),
		emitsCache: /* @__PURE__ */ new WeakMap()
	};
}
var uid$1 = 0;
function createAppAPI(e, t) {
	return function(n, r = null) {
		isFunction(n) || (n = extend({}, n)), r != null && !isObject$1(r) && (r = null);
		let i = createAppContext(), a = /* @__PURE__ */ new WeakSet(), o = [], c = !1, l = i.app = {
			_uid: uid$1++,
			_component: n,
			_props: r,
			_container: null,
			_context: i,
			_instance: null,
			version,
			get config() {
				return i.config;
			},
			set config(e) {},
			use(e, ...t) {
				return a.has(e) || (e && isFunction(e.install) ? (a.add(e), e.install(l, ...t)) : isFunction(e) && (a.add(e), e(l, ...t))), l;
			},
			mixin(e) {
				return i.mixins.includes(e) || i.mixins.push(e), l;
			},
			component(e, t) {
				return t ? (i.components[e] = t, l) : i.components[e];
			},
			directive(e, t) {
				return t ? (i.directives[e] = t, l) : i.directives[e];
			},
			mount(a, o, s) {
				if (!c) {
					let u = l._ceVNode || createVNode(n, r);
					return u.appContext = i, s === !0 ? s = "svg" : s === !1 && (s = void 0), o && t ? t(u, a) : e(u, a, s), c = !0, l._container = a, a.__vue_app__ = l, getComponentPublicInstance(u.component);
				}
			},
			onUnmount(e) {
				o.push(e);
			},
			unmount() {
				c && (callWithAsyncErrorHandling(o, l._instance, 16), e(null, l._container), delete l._container.__vue_app__);
			},
			provide(e, t) {
				return i.provides[e] = t, l;
			},
			runWithContext(e) {
				let t = currentApp;
				currentApp = l;
				try {
					return e();
				} finally {
					currentApp = t;
				}
			}
		};
		return l;
	};
}
var currentApp = null;
function provide(e, t) {
	if (currentInstance) {
		let n = currentInstance.provides, r = currentInstance.parent && currentInstance.parent.provides;
		r === n && (n = currentInstance.provides = Object.create(r)), n[e] = t;
	}
}
function inject(e, t, n = !1) {
	let r = getCurrentInstance();
	if (r || currentApp) {
		let i = currentApp ? currentApp._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
		if (i && e in i) return i[e];
		if (arguments.length > 1) return n && isFunction(t) ? t.call(r && r.proxy) : t;
	}
}
function hasInjectionContext() {
	return !!(getCurrentInstance() || currentApp);
}
var ssrContextKey = Symbol.for("v-scx"), useSSRContext = () => inject(ssrContextKey);
function watch(e, t, n) {
	return doWatch(e, t, n);
}
function doWatch(e, n, i = EMPTY_OBJ) {
	let { immediate: a, deep: o, flush: c, once: l } = i, u = extend({}, i), d = n && a || !n && c !== "post", f;
	if (isInSSRComponentSetup) {
		if (c === "sync") {
			let e = useSSRContext();
			f = e.__watcherHandles ||= [];
		} else if (!d) {
			let e = () => {};
			return e.stop = NOOP, e.resume = NOOP, e.pause = NOOP, e;
		}
	}
	let m = currentInstance;
	u.call = (e, t, n) => callWithAsyncErrorHandling(e, m, t, n);
	let g = !1;
	c === "post" ? u.scheduler = (e) => {
		queuePostRenderEffect(e, m && m.suspense);
	} : c !== "sync" && (g = !0, u.scheduler = (e, t) => {
		t ? e() : queueJob(e);
	}), u.augmentJob = (e) => {
		n && (e.flags |= 4), g && (e.flags |= 2, m && (e.id = m.uid, e.i = m));
	};
	let _ = watch$1(e, n, u);
	return isInSSRComponentSetup && (f ? f.push(_) : d && _()), _;
}
function instanceWatch(e, t, n) {
	let r = this.proxy, i = isString(e) ? e.includes(".") ? createPathGetter(r, e) : () => r[e] : e.bind(r, r), a;
	isFunction(t) ? a = t : (a = t.handler, n = t);
	let o = setCurrentInstance(this), s = doWatch(i, a.bind(r), n);
	return o(), s;
}
function createPathGetter(e, t) {
	let n = t.split(".");
	return () => {
		let t = e;
		for (let e = 0; e < n.length && t; e++) t = t[n[e]];
		return t;
	};
}
var getModelModifiers = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${camelize$1(t)}Modifiers`] || e[`${hyphenate$1(t)}Modifiers`];
function emit(e, n, ...r) {
	if (e.isUnmounted) return;
	let i = e.vnode.props || EMPTY_OBJ, a = r, o = n.startsWith("update:"), s = o && getModelModifiers(i, n.slice(7));
	s && (s.trim && (a = r.map((e) => isString(e) ? e.trim() : e)), s.number && (a = r.map(looseToNumber)));
	let c, l = i[c = toHandlerKey(n)] || i[c = toHandlerKey(camelize$1(n))];
	!l && o && (l = i[c = toHandlerKey(hyphenate$1(n))]), l && callWithAsyncErrorHandling(l, e, 6, a);
	let u = i[c + "Once"];
	if (u) {
		if (!e.emitted) e.emitted = {};
		else if (e.emitted[c]) return;
		e.emitted[c] = !0, callWithAsyncErrorHandling(u, e, 6, a);
	}
}
var mixinEmitsCache = /* @__PURE__ */ new WeakMap();
function normalizeEmitsOptions(e, t, n = !1) {
	let r = n ? mixinEmitsCache : t.emitsCache, i = r.get(e);
	if (i !== void 0) return i;
	let a = e.emits, o = {}, c = !1;
	if (!isFunction(e)) {
		let r = (e) => {
			let n = normalizeEmitsOptions(e, t, !0);
			n && (c = !0, extend(o, n));
		};
		!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r);
	}
	return !a && !c ? (isObject$1(e) && r.set(e, null), null) : (isArray(a) ? a.forEach((e) => o[e] = null) : extend(o, a), isObject$1(e) && r.set(e, o), o);
}
function isEmitListener(e, t) {
	return !e || !isOn(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), hasOwn$1(e, t[0].toLowerCase() + t.slice(1)) || hasOwn$1(e, hyphenate$1(t)) || hasOwn$1(e, t));
}
function renderComponentRoot(e) {
	let { type: t, vnode: n, proxy: r, withProxy: i, propsOptions: [a], slots: s, attrs: c, emit: l, render: u, renderCache: d, props: f, data: m, setupState: g, ctx: _, inheritAttrs: v } = e, y = setCurrentRenderingInstance(e), b, x;
	try {
		if (n.shapeFlag & 4) {
			let e = i || r, t = e;
			b = normalizeVNode(u.call(t, e, d, f, g, m, _)), x = c;
		} else {
			let e = t;
			b = normalizeVNode(e.length > 1 ? e(f, {
				attrs: c,
				slots: s,
				emit: l
			}) : e(f, null)), x = t.props ? c : getFunctionalFallthrough(c);
		}
	} catch (t) {
		blockStack.length = 0, handleError(t, e, 1), b = createVNode(Comment);
	}
	let S = b;
	if (x && v !== !1) {
		let e = Object.keys(x), { shapeFlag: t } = S;
		e.length && t & 7 && (a && e.some(isModelListener) && (x = filterModelListeners(x, a)), S = cloneVNode(S, x, !1, !0));
	}
	return n.dirs && (S = cloneVNode(S, null, !1, !0), S.dirs = S.dirs ? S.dirs.concat(n.dirs) : n.dirs), n.transition && setTransitionHooks(S, n.transition), b = S, setCurrentRenderingInstance(y), b;
}
function filterSingleRoot(e, t = !0) {
	let n;
	for (let t = 0; t < e.length; t++) {
		let r = e[t];
		if (isVNode(r)) {
			if (r.type !== Comment || r.children === "v-if") {
				if (n) return;
				n = r;
			}
		} else return;
	}
	return n;
}
var getFunctionalFallthrough = (e) => {
	let t;
	for (let n in e) (n === "class" || n === "style" || isOn(n)) && ((t ||= {})[n] = e[n]);
	return t;
}, filterModelListeners = (e, t) => {
	let n = {};
	for (let r in e) (!isModelListener(r) || !(r.slice(9) in t)) && (n[r] = e[r]);
	return n;
};
function shouldUpdateComponent(e, t, n) {
	let { props: r, children: i, component: a } = e, { props: o, children: s, patchFlag: c } = t, l = a.emitsOptions;
	if (t.dirs || t.transition) return !0;
	if (n && c >= 0) {
		if (c & 1024) return !0;
		if (c & 16) return r ? hasPropsChanged(r, o, l) : !!o;
		if (c & 8) {
			let e = t.dynamicProps;
			for (let t = 0; t < e.length; t++) {
				let n = e[t];
				if (o[n] !== r[n] && !isEmitListener(l, n)) return !0;
			}
		}
	} else return (i || s) && (!s || !s.$stable) ? !0 : r === o ? !1 : r ? o ? hasPropsChanged(r, o, l) : !0 : !!o;
	return !1;
}
function hasPropsChanged(e, t, n) {
	let r = Object.keys(t);
	if (r.length !== Object.keys(e).length) return !0;
	for (let i = 0; i < r.length; i++) {
		let a = r[i];
		if (t[a] !== e[a] && !isEmitListener(n, a)) return !0;
	}
	return !1;
}
function updateHOCHostEl({ vnode: e, parent: t }, n) {
	for (; t;) {
		let r = t.subTree;
		if (r.suspense && r.suspense.activeBranch === e && (r.el = e.el), r === e) (e = t.vnode).el = n, t = t.parent;
		else break;
	}
}
var internalObjectProto = {}, createInternalObject = () => Object.create(internalObjectProto), isInternalObject = (e) => Object.getPrototypeOf(e) === internalObjectProto;
function initProps(e, t, n, r = !1) {
	let i = {}, a = createInternalObject();
	for (let n in e.propsDefaults = /* @__PURE__ */ Object.create(null), setFullProps(e, t, i, a), e.propsOptions[0]) n in i || (i[n] = void 0);
	n ? e.props = r ? i : shallowReactive(i) : e.type.props ? e.props = i : e.props = a, e.attrs = a;
}
function updateProps(e, t, n, r) {
	let { props: i, attrs: a, vnode: { patchFlag: o } } = e, s = toRaw(i), [c] = e.propsOptions, l = !1;
	if ((r || o > 0) && !(o & 16)) {
		if (o & 8) {
			let n = e.vnode.dynamicProps;
			for (let r = 0; r < n.length; r++) {
				let o = n[r];
				if (isEmitListener(e.emitsOptions, o)) continue;
				let d = t[o];
				if (c) if (hasOwn$1(a, o)) d !== a[o] && (a[o] = d, l = !0);
				else {
					let t = camelize$1(o);
					i[t] = resolvePropValue(c, s, t, d, e, !1);
				}
				else d !== a[o] && (a[o] = d, l = !0);
			}
		}
	} else {
		setFullProps(e, t, i, a) && (l = !0);
		let r;
		for (let a in s) (!t || !hasOwn$1(t, a) && ((r = hyphenate$1(a)) === a || !hasOwn$1(t, r))) && (c ? n && (n[a] !== void 0 || n[r] !== void 0) && (i[a] = resolvePropValue(c, s, a, void 0, e, !0)) : delete i[a]);
		if (a !== s) for (let e in a) (!t || !hasOwn$1(t, e)) && (delete a[e], l = !0);
	}
	l && trigger(e.attrs, "set", "");
}
function setFullProps(e, n, r, i) {
	let [a, o] = e.propsOptions, s = !1, c;
	if (n) for (let t in n) {
		if (isReservedProp(t)) continue;
		let l = n[t], d;
		a && hasOwn$1(a, d = camelize$1(t)) ? !o || !o.includes(d) ? r[d] = l : (c ||= {})[d] = l : isEmitListener(e.emitsOptions, t) || (!(t in i) || l !== i[t]) && (i[t] = l, s = !0);
	}
	if (o) {
		let n = toRaw(r), i = c || EMPTY_OBJ;
		for (let t = 0; t < o.length; t++) {
			let s = o[t];
			r[s] = resolvePropValue(a, n, s, i[s], e, !hasOwn$1(i, s));
		}
	}
	return s;
}
function resolvePropValue(e, t, n, r, i, a) {
	let o = e[n];
	if (o != null) {
		let e = hasOwn$1(o, "default");
		if (e && r === void 0) {
			let e = o.default;
			if (o.type !== Function && !o.skipFactory && isFunction(e)) {
				let { propsDefaults: a } = i;
				if (n in a) r = a[n];
				else {
					let o = setCurrentInstance(i);
					r = a[n] = e.call(null, t), o();
				}
			} else r = e;
			i.ce && i.ce._setProp(n, r);
		}
		o[0] && (a && !e ? r = !1 : o[1] && (r === "" || r === hyphenate$1(n)) && (r = !0));
	}
	return r;
}
var mixinPropsCache = /* @__PURE__ */ new WeakMap();
function normalizePropsOptions(e, r, i = !1) {
	let a = i ? mixinPropsCache : r.propsCache, o = a.get(e);
	if (o) return o;
	let c = e.props, l = {}, f = [], m = !1;
	if (!isFunction(e)) {
		let t = (e) => {
			m = !0;
			let [t, n] = normalizePropsOptions(e, r, !0);
			extend(l, t), n && f.push(...n);
		};
		!i && r.mixins.length && r.mixins.forEach(t), e.extends && t(e.extends), e.mixins && e.mixins.forEach(t);
	}
	if (!c && !m) return isObject$1(e) && a.set(e, EMPTY_ARR), EMPTY_ARR;
	if (isArray(c)) for (let e = 0; e < c.length; e++) {
		let n = camelize$1(c[e]);
		validatePropName(n) && (l[n] = EMPTY_OBJ);
	}
	else if (c) for (let e in c) {
		let t = camelize$1(e);
		if (validatePropName(t)) {
			let n = c[e], r = l[t] = isArray(n) || isFunction(n) ? { type: n } : extend({}, n), i = r.type, a = !1, o = !0;
			if (isArray(i)) for (let e = 0; e < i.length; ++e) {
				let t = i[e], n = isFunction(t) && t.name;
				if (n === "Boolean") {
					a = !0;
					break;
				} else n === "String" && (o = !1);
			}
			else a = isFunction(i) && i.name === "Boolean";
			r[0] = a, r[1] = o, (a || hasOwn$1(r, "default")) && f.push(t);
		}
	}
	let _ = [l, f];
	return isObject$1(e) && a.set(e, _), _;
}
function validatePropName(e) {
	return e[0] !== "$" && !isReservedProp(e);
}
var isInternalKey = (e) => e === "_" || e === "_ctx" || e === "$stable", normalizeSlotValue = (e) => isArray(e) ? e.map(normalizeVNode) : [normalizeVNode(e)], normalizeSlot = (e, t, n) => {
	if (t._n) return t;
	let r = withCtx((...e) => normalizeSlotValue(t(...e)), n);
	return r._c = !1, r;
}, normalizeObjectSlots = (e, t, n) => {
	let r = e._ctx;
	for (let n in e) {
		if (isInternalKey(n)) continue;
		let i = e[n];
		if (isFunction(i)) t[n] = normalizeSlot(n, i, r);
		else if (i != null) {
			let e = normalizeSlotValue(i);
			t[n] = () => e;
		}
	}
}, normalizeVNodeSlots = (e, t) => {
	let n = normalizeSlotValue(t);
	e.slots.default = () => n;
}, assignSlots = (e, t, n) => {
	for (let r in t) (n || !isInternalKey(r)) && (e[r] = t[r]);
}, initSlots = (e, t, n) => {
	let r = e.slots = createInternalObject();
	if (e.vnode.shapeFlag & 32) {
		let e = t._;
		e ? (assignSlots(r, t, n), n && def(r, "_", e, !0)) : normalizeObjectSlots(t, r);
	} else t && normalizeVNodeSlots(e, t);
}, updateSlots = (e, n, r) => {
	let { vnode: i, slots: a } = e, o = !0, s = EMPTY_OBJ;
	if (i.shapeFlag & 32) {
		let e = n._;
		e ? r && e === 1 ? o = !1 : assignSlots(a, n, r) : (o = !n.$stable, normalizeObjectSlots(n, a)), s = n;
	} else n && (normalizeVNodeSlots(e, n), s = { default: 1 });
	if (o) for (let e in a) !isInternalKey(e) && s[e] == null && delete a[e];
}, queuePostRenderEffect = queueEffectWithSuspense;
function createRenderer(e) {
	return baseCreateRenderer(e);
}
function baseCreateRenderer(e, i) {
	let a = getGlobalThis();
	a.__VUE__ = !0;
	let { insert: o, remove: s, patchProp: c, createElement: l, createText: u, createComment: d, setText: f, setElementText: m, parentNode: g, nextSibling: _, setScopeId: v = NOOP, insertStaticContent: y } = e, b = (e, t, n, r = null, i = null, a = null, o = void 0, s = null, c = !!t.dynamicChildren) => {
		if (e === t) return;
		e && !isSameVNodeType(e, t) && (r = J(e), G(e, i, a, !0), e = null), t.patchFlag === -2 && (c = !1, t.dynamicChildren = null);
		let { type: l, ref: u, shapeFlag: d } = t;
		switch (l) {
			case Text:
				x(e, t, n, r);
				break;
			case Comment:
				S(e, t, n, r);
				break;
			case Static:
				e ?? C(t, n, r, o);
				break;
			case Fragment:
				P(e, t, n, r, i, a, o, s, c);
				break;
			default: d & 1 ? D(e, t, n, r, i, a, o, s, c) : d & 6 ? I(e, t, n, r, i, a, o, s, c) : (d & 64 || d & 128) && l.process(e, t, n, r, i, a, o, s, c, Z);
		}
		u != null && i ? setRef(u, e && e.ref, a, t || e, !t) : u == null && e && e.ref != null && setRef(e.ref, null, a, e, !0);
	}, x = (e, t, n, r) => {
		if (e == null) o(t.el = u(t.children), n, r);
		else {
			let n = t.el = e.el;
			t.children !== e.children && f(n, t.children);
		}
	}, S = (e, t, n, r) => {
		e == null ? o(t.el = d(t.children || ""), n, r) : t.el = e.el;
	}, C = (e, t, n, r) => {
		[e.el, e.anchor] = y(e.children, t, n, r, e.el, e.anchor);
	}, w = ({ el: e, anchor: t }, n, r) => {
		let i;
		for (; e && e !== t;) i = _(e), o(e, n, r), e = i;
		o(t, n, r);
	}, T = ({ el: e, anchor: t }) => {
		let n;
		for (; e && e !== t;) n = _(e), s(e), e = n;
		s(t);
	}, D = (e, t, n, r, i, a, o, s, c) => {
		if (t.type === "svg" ? o = "svg" : t.type === "math" && (o = "mathml"), e == null) O(t, n, r, i, a, o, s, c);
		else {
			let n = e.el && e.el._isVueCE ? e.el : null;
			try {
				n && n._beginPatch(), j(e, t, i, a, o, s, c);
			} finally {
				n && n._endPatch();
			}
		}
	}, O = (e, t, n, r, i, a, s, u) => {
		let d, f, { props: g, shapeFlag: _, transition: v, dirs: y } = e;
		if (d = e.el = l(e.type, a, g && g.is, g), _ & 8 ? m(d, e.children) : _ & 16 && A(e.children, d, null, r, i, resolveChildrenNamespace(e, a), s, u), y && invokeDirectiveHook(e, null, r, "created"), k(d, e, e.scopeId, s, r), g) {
			for (let e in g) e !== "value" && !isReservedProp(e) && c(d, e, null, g[e], a, r);
			"value" in g && c(d, "value", null, g.value, a), (f = g.onVnodeBeforeMount) && invokeVNodeHook(f, r, e);
		}
		y && invokeDirectiveHook(e, null, r, "beforeMount");
		let b = needTransition(i, v);
		b && v.beforeEnter(d), o(d, t, n), ((f = g && g.onVnodeMounted) || b || y) && queuePostRenderEffect(() => {
			f && invokeVNodeHook(f, r, e), b && v.enter(d), y && invokeDirectiveHook(e, null, r, "mounted");
		}, i);
	}, k = (e, t, n, r, i) => {
		if (n && v(e, n), r) for (let t = 0; t < r.length; t++) v(e, r[t]);
		if (i) {
			let n = i.subTree;
			if (t === n || isSuspense(n.type) && (n.ssContent === t || n.ssFallback === t)) {
				let t = i.vnode;
				k(e, t, t.scopeId, t.slotScopeIds, i.parent);
			}
		}
	}, A = (e, t, n, r, i, a, o, s, c = 0) => {
		for (let l = c; l < e.length; l++) b(null, e[l] = s ? cloneIfMounted(e[l]) : normalizeVNode(e[l]), t, n, r, i, a, o, s);
	}, j = (e, n, r, i, a, o, s) => {
		let l = n.el = e.el, { patchFlag: u, dynamicChildren: d, dirs: f } = n;
		u |= e.patchFlag & 16;
		let g = e.props || EMPTY_OBJ, _ = n.props || EMPTY_OBJ, v;
		if (r && toggleRecurse(r, !1), (v = _.onVnodeBeforeUpdate) && invokeVNodeHook(v, r, n, e), f && invokeDirectiveHook(n, e, r, "beforeUpdate"), r && toggleRecurse(r, !0), (g.innerHTML && _.innerHTML == null || g.textContent && _.textContent == null) && m(l, ""), d ? M(e.dynamicChildren, d, l, r, i, resolveChildrenNamespace(n, a), o) : s || V(e, n, l, null, r, i, resolveChildrenNamespace(n, a), o, !1), u > 0) {
			if (u & 16) N(l, g, _, r, a);
			else if (u & 2 && g.class !== _.class && c(l, "class", null, _.class, a), u & 4 && c(l, "style", g.style, _.style, a), u & 8) {
				let e = n.dynamicProps;
				for (let t = 0; t < e.length; t++) {
					let n = e[t], i = g[n], o = _[n];
					(o !== i || n === "value") && c(l, n, i, o, a, r);
				}
			}
			u & 1 && e.children !== n.children && m(l, n.children);
		} else !s && d == null && N(l, g, _, r, a);
		((v = _.onVnodeUpdated) || f) && queuePostRenderEffect(() => {
			v && invokeVNodeHook(v, r, n, e), f && invokeDirectiveHook(n, e, r, "updated");
		}, i);
	}, M = (e, t, n, r, i, a, o) => {
		for (let s = 0; s < t.length; s++) {
			let c = e[s], l = t[s];
			b(c, l, c.el && (c.type === Fragment || !isSameVNodeType(c, l) || c.shapeFlag & 198) ? g(c.el) : n, null, r, i, a, o, !0);
		}
	}, N = (e, n, r, i, a) => {
		if (n !== r) {
			if (n !== EMPTY_OBJ) for (let t in n) !isReservedProp(t) && !(t in r) && c(e, t, n[t], null, a, i);
			for (let t in r) {
				if (isReservedProp(t)) continue;
				let o = r[t], s = n[t];
				o !== s && t !== "value" && c(e, t, s, o, a, i);
			}
			"value" in r && c(e, "value", n.value, r.value, a);
		}
	}, P = (e, t, n, r, i, a, s, c, l) => {
		let d = t.el = e ? e.el : u(""), f = t.anchor = e ? e.anchor : u(""), { patchFlag: m, dynamicChildren: g, slotScopeIds: _ } = t;
		_ && (c = c ? c.concat(_) : _), e == null ? (o(d, n, r), o(f, n, r), A(t.children || [], n, f, i, a, s, c, l)) : m > 0 && m & 64 && g && e.dynamicChildren ? (M(e.dynamicChildren, g, n, i, a, s, c), (t.key != null || i && t === i.subTree) && traverseStaticChildren(e, t, !0)) : V(e, t, n, f, i, a, s, c, l);
	}, I = (e, t, n, r, i, a, o, s, c) => {
		t.slotScopeIds = s, e == null ? t.shapeFlag & 512 ? i.ctx.activate(t, n, r, o, c) : L(t, n, r, i, a, o, c) : R(e, t, c);
	}, L = (e, t, n, r, i, a, o) => {
		let s = e.component = createComponentInstance(e, r, i);
		if (isKeepAlive(e) && (s.ctx.renderer = Z), setupComponent(s, !1, o), s.asyncDep) {
			if (i && i.registerDep(s, z, o), !e.el) {
				let r = s.subTree = createVNode(Comment);
				S(null, r, t, n), e.placeholder = r.el;
			}
		} else z(s, e, t, n, i, a, o);
	}, R = (e, t, n) => {
		let r = t.component = e.component;
		if (shouldUpdateComponent(e, t, n)) if (r.asyncDep && !r.asyncResolved) {
			B(r, t, n);
			return;
		} else r.next = t, r.update();
		else t.el = e.el, r.vnode = t;
	}, z = (e, t, n, r, i, a, o) => {
		let s = () => {
			if (e.isMounted) {
				let { next: t, bu: n, u: r, parent: c, vnode: l } = e;
				{
					let n = locateNonHydratedAsyncRoot(e);
					if (n) {
						t && (t.el = l.el, B(e, t, o)), n.asyncDep.then(() => {
							e.isUnmounted || s();
						});
						return;
					}
				}
				let u = t, d;
				toggleRecurse(e, !1), t ? (t.el = l.el, B(e, t, o)) : t = l, n && invokeArrayFns(n), (d = t.props && t.props.onVnodeBeforeUpdate) && invokeVNodeHook(d, c, t, l), toggleRecurse(e, !0);
				let f = renderComponentRoot(e), m = e.subTree;
				e.subTree = f, b(m, f, g(m.el), J(m), e, i, a), t.el = f.el, u === null && updateHOCHostEl(e, f.el), r && queuePostRenderEffect(r, i), (d = t.props && t.props.onVnodeUpdated) && queuePostRenderEffect(() => invokeVNodeHook(d, c, t, l), i);
			} else {
				let o, { el: s, props: c } = t, { bm: l, m: u, parent: d, root: f, type: m } = e, g = isAsyncWrapper(t);
				if (toggleRecurse(e, !1), l && invokeArrayFns(l), !g && (o = c && c.onVnodeBeforeMount) && invokeVNodeHook(o, d, t), toggleRecurse(e, !0), s && $) {
					let t = () => {
						e.subTree = renderComponentRoot(e), $(s, e.subTree, e, i, null);
					};
					g && m.__asyncHydrate ? m.__asyncHydrate(s, e, t) : t();
				} else {
					f.ce && f.ce._def.shadowRoot !== !1 && f.ce._injectChildStyle(m);
					let o = e.subTree = renderComponentRoot(e);
					b(null, o, n, r, e, i, a), t.el = o.el;
				}
				if (u && queuePostRenderEffect(u, i), !g && (o = c && c.onVnodeMounted)) {
					let e = t;
					queuePostRenderEffect(() => invokeVNodeHook(o, d, e), i);
				}
				(t.shapeFlag & 256 || d && isAsyncWrapper(d.vnode) && d.vnode.shapeFlag & 256) && e.a && queuePostRenderEffect(e.a, i), e.isMounted = !0, t = n = r = null;
			}
		};
		e.scope.on();
		let c = e.effect = new ReactiveEffect(s);
		e.scope.off();
		let l = e.update = c.run.bind(c), u = e.job = c.runIfDirty.bind(c);
		u.i = e, u.id = e.uid, c.scheduler = () => queueJob(u), toggleRecurse(e, !0), l();
	}, B = (e, t, n) => {
		t.component = e;
		let r = e.vnode.props;
		e.vnode = t, e.next = null, updateProps(e, t.props, r, n), updateSlots(e, t.children, n), pauseTracking(), flushPreFlushCbs(e), resetTracking();
	}, V = (e, t, n, r, i, a, o, s, c = !1) => {
		let l = e && e.children, u = e ? e.shapeFlag : 0, d = t.children, { patchFlag: f, shapeFlag: g } = t;
		if (f > 0) {
			if (f & 128) {
				U(l, d, n, r, i, a, o, s, c);
				return;
			} else if (f & 256) {
				H(l, d, n, r, i, a, o, s, c);
				return;
			}
		}
		g & 8 ? (u & 16 && q(l, i, a), d !== l && m(n, d)) : u & 16 ? g & 16 ? U(l, d, n, r, i, a, o, s, c) : q(l, i, a, !0) : (u & 8 && m(n, ""), g & 16 && A(d, n, r, i, a, o, s, c));
	}, H = (e, t, r, i, a, o, s, c, l) => {
		e ||= EMPTY_ARR, t ||= EMPTY_ARR;
		let u = e.length, d = t.length, f = Math.min(u, d), m;
		for (m = 0; m < f; m++) {
			let n = t[m] = l ? cloneIfMounted(t[m]) : normalizeVNode(t[m]);
			b(e[m], n, r, null, a, o, s, c, l);
		}
		u > d ? q(e, a, o, !0, !1, f) : A(t, r, i, a, o, s, c, l, f);
	}, U = (e, t, r, i, a, o, s, c, l) => {
		let u = 0, d = t.length, f = e.length - 1, m = d - 1;
		for (; u <= f && u <= m;) {
			let n = e[u], i = t[u] = l ? cloneIfMounted(t[u]) : normalizeVNode(t[u]);
			if (isSameVNodeType(n, i)) b(n, i, r, null, a, o, s, c, l);
			else break;
			u++;
		}
		for (; u <= f && u <= m;) {
			let n = e[f], i = t[m] = l ? cloneIfMounted(t[m]) : normalizeVNode(t[m]);
			if (isSameVNodeType(n, i)) b(n, i, r, null, a, o, s, c, l);
			else break;
			f--, m--;
		}
		if (u > f) {
			if (u <= m) {
				let e = m + 1, n = e < d ? t[e].el : i;
				for (; u <= m;) b(null, t[u] = l ? cloneIfMounted(t[u]) : normalizeVNode(t[u]), r, n, a, o, s, c, l), u++;
			}
		} else if (u > m) for (; u <= f;) G(e[u], a, o, !0), u++;
		else {
			let g = u, _ = u, v = /* @__PURE__ */ new Map();
			for (u = _; u <= m; u++) {
				let e = t[u] = l ? cloneIfMounted(t[u]) : normalizeVNode(t[u]);
				e.key != null && v.set(e.key, u);
			}
			let y, x = 0, S = m - _ + 1, C = !1, w = 0, T = Array(S);
			for (u = 0; u < S; u++) T[u] = 0;
			for (u = g; u <= f; u++) {
				let n = e[u];
				if (x >= S) {
					G(n, a, o, !0);
					continue;
				}
				let i;
				if (n.key != null) i = v.get(n.key);
				else for (y = _; y <= m; y++) if (T[y - _] === 0 && isSameVNodeType(n, t[y])) {
					i = y;
					break;
				}
				i === void 0 ? G(n, a, o, !0) : (T[i - _] = u + 1, i >= w ? w = i : C = !0, b(n, t[i], r, null, a, o, s, c, l), x++);
			}
			let E = C ? getSequence(T) : EMPTY_ARR;
			for (y = E.length - 1, u = S - 1; u >= 0; u--) {
				let e = _ + u, n = t[e], f = t[e + 1], m = e + 1 < d ? f.el || f.placeholder : i;
				T[u] === 0 ? b(null, n, r, m, a, o, s, c, l) : C && (y < 0 || u !== E[y] ? W(n, r, m, 2) : y--);
			}
		}
	}, W = (e, t, n, r, i = null) => {
		let { el: a, type: c, transition: l, children: u, shapeFlag: d } = e;
		if (d & 6) {
			W(e.component.subTree, t, n, r);
			return;
		}
		if (d & 128) {
			e.suspense.move(t, n, r);
			return;
		}
		if (d & 64) {
			c.move(e, t, n, Z);
			return;
		}
		if (c === Fragment) {
			o(a, t, n);
			for (let e = 0; e < u.length; e++) W(u[e], t, n, r);
			o(e.anchor, t, n);
			return;
		}
		if (c === Static) {
			w(e, t, n);
			return;
		}
		if (r !== 2 && d & 1 && l) if (r === 0) l.beforeEnter(a), o(a, t, n), queuePostRenderEffect(() => l.enter(a), i);
		else {
			let { leave: r, delayLeave: i, afterLeave: c } = l, u = () => {
				e.ctx.isUnmounted ? s(a) : o(a, t, n);
			}, d = () => {
				a._isLeaving && a[leaveCbKey](!0), r(a, () => {
					u(), c && c();
				});
			};
			i ? i(a, u, d) : d();
		}
		else o(a, t, n);
	}, G = (e, t, n, r = !1, i = !1) => {
		let { type: a, props: o, ref: s, children: c, dynamicChildren: l, shapeFlag: u, patchFlag: d, dirs: f, cacheIndex: m } = e;
		if (d === -2 && (i = !1), s != null && (pauseTracking(), setRef(s, null, n, e, !0), resetTracking()), m != null && (t.renderCache[m] = void 0), u & 256) {
			t.ctx.deactivate(e);
			return;
		}
		let g = u & 1 && f, _ = !isAsyncWrapper(e), v;
		if (_ && (v = o && o.onVnodeBeforeUnmount) && invokeVNodeHook(v, t, e), u & 6) Kl(e.component, n, r);
		else {
			if (u & 128) {
				e.suspense.unmount(n, r);
				return;
			}
			g && invokeDirectiveHook(e, null, t, "beforeUnmount"), u & 64 ? e.type.remove(e, t, n, Z, r) : l && !l.hasOnce && (a !== Fragment || d > 0 && d & 64) ? q(l, t, n, !1, !0) : (a === Fragment && d & 384 || !i && u & 16) && q(c, t, n), r && K(e);
		}
		(_ && (v = o && o.onVnodeUnmounted) || g) && queuePostRenderEffect(() => {
			v && invokeVNodeHook(v, t, e), g && invokeDirectiveHook(e, null, t, "unmounted");
		}, n);
	}, K = (e) => {
		let { type: t, el: n, anchor: r, transition: i } = e;
		if (t === Fragment) {
			Gl(n, r);
			return;
		}
		if (t === Static) {
			T(e);
			return;
		}
		let a = () => {
			s(n), i && !i.persisted && i.afterLeave && i.afterLeave();
		};
		if (e.shapeFlag & 1 && i && !i.persisted) {
			let { leave: t, delayLeave: r } = i, o = () => t(n, a);
			r ? r(e.el, a, o) : o();
		} else a();
	}, Gl = (e, t) => {
		let n;
		for (; e !== t;) n = _(e), s(e), e = n;
		s(t);
	}, Kl = (e, t, n) => {
		let { bum: r, scope: i, job: a, subTree: o, um: s, m: c, a: l } = e;
		invalidateMount(c), invalidateMount(l), r && invokeArrayFns(r), i.stop(), a && (a.flags |= 8, G(o, e, t, n)), s && queuePostRenderEffect(s, t), queuePostRenderEffect(() => {
			e.isUnmounted = !0;
		}, t);
	}, q = (e, t, n, r = !1, i = !1, a = 0) => {
		for (let o = a; o < e.length; o++) G(e[o], t, n, r, i);
	}, J = (e) => {
		if (e.shapeFlag & 6) return J(e.component.subTree);
		if (e.shapeFlag & 128) return e.suspense.next();
		let t = _(e.anchor || e.el), n = t && t[TeleportEndKey];
		return n ? _(n) : t;
	}, Y = !1, X = (e, t, n) => {
		e == null ? t._vnode && G(t._vnode, null, null, !0) : b(t._vnode || null, e, t, null, null, null, n), t._vnode = e, Y ||= (Y = !0, flushPreFlushCbs(), flushPostFlushCbs(), !1);
	}, Z = {
		p: b,
		um: G,
		m: W,
		r: K,
		mt: L,
		mc: A,
		pc: V,
		pbc: M,
		n: J,
		o: e
	}, Q, $;
	return i && ([Q, $] = i(Z)), {
		render: X,
		hydrate: Q,
		createApp: createAppAPI(X, Q)
	};
}
function resolveChildrenNamespace({ type: e, props: t }, n) {
	return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function toggleRecurse({ effect: e, job: t }, n) {
	n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function needTransition(e, t) {
	return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function traverseStaticChildren(e, t, n = !1) {
	let r = e.children, i = t.children;
	if (isArray(r) && isArray(i)) for (let e = 0; e < r.length; e++) {
		let t = r[e], a = i[e];
		a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = i[e] = cloneIfMounted(i[e]), a.el = t.el), !n && a.patchFlag !== -2 && traverseStaticChildren(t, a)), a.type === Text && a.patchFlag !== -1 && (a.el = t.el), a.type === Comment && !a.el && (a.el = t.el);
	}
}
function getSequence(e) {
	let t = e.slice(), n = [0], r, i, a, o, s, c = e.length;
	for (r = 0; r < c; r++) {
		let c = e[r];
		if (c !== 0) {
			if (i = n[n.length - 1], e[i] < c) {
				t[r] = i, n.push(r);
				continue;
			}
			for (a = 0, o = n.length - 1; a < o;) s = a + o >> 1, e[n[s]] < c ? a = s + 1 : o = s;
			c < e[n[a]] && (a > 0 && (t[r] = n[a - 1]), n[a] = r);
		}
	}
	for (a = n.length, o = n[a - 1]; a-- > 0;) n[a] = o, o = t[o];
	return n;
}
function locateNonHydratedAsyncRoot(e) {
	let t = e.subTree.component;
	if (t) return t.asyncDep && !t.asyncResolved ? t : locateNonHydratedAsyncRoot(t);
}
function invalidateMount(e) {
	if (e) for (let t = 0; t < e.length; t++) e[t].flags |= 8;
}
var isSuspense = (e) => e.__isSuspense, suspenseId = 0, Suspense = {
	name: "Suspense",
	__isSuspense: !0,
	process(e, t, n, r, i, a, o, s, c, l) {
		if (e == null) mountSuspense(t, n, r, i, a, o, s, c, l);
		else {
			if (a && a.deps > 0 && !e.suspense.isInFallback) {
				t.suspense = e.suspense, t.suspense.vnode = t, t.el = e.el;
				return;
			}
			patchSuspense(e, t, n, r, i, o, s, c, l);
		}
	},
	hydrate: hydrateSuspense,
	normalize: normalizeSuspenseChildren
};
function triggerEvent(e, t) {
	let n = e.props && e.props[t];
	isFunction(n) && n();
}
function mountSuspense(e, t, n, r, i, a, o, s, c) {
	let { p: l, o: { createElement: u } } = c, d = u("div"), f = e.suspense = createSuspenseBoundary(e, i, r, t, d, n, a, o, s, c);
	l(null, f.pendingBranch = e.ssContent, d, null, r, f, a, o), f.deps > 0 ? (triggerEvent(e, "onPending"), triggerEvent(e, "onFallback"), l(null, e.ssFallback, t, n, r, null, a, o), setActiveBranch(f, e.ssFallback)) : f.resolve(!1, !0);
}
function patchSuspense(e, t, n, r, i, a, o, s, { p: c, um: l, o: { createElement: u } }) {
	let d = t.suspense = e.suspense;
	d.vnode = t, t.el = e.el;
	let f = t.ssContent, m = t.ssFallback, { activeBranch: g, pendingBranch: _, isInFallback: v, isHydrating: y } = d;
	if (_) d.pendingBranch = f, isSameVNodeType(_, f) ? (c(_, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0 ? d.resolve() : v && (y || (c(g, m, n, r, i, null, a, o, s), setActiveBranch(d, m)))) : (d.pendingId = suspenseId++, y ? (d.isHydrating = !1, d.activeBranch = _) : l(_, i, d), d.deps = 0, d.effects.length = 0, d.hiddenContainer = u("div"), v ? (c(null, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0 ? d.resolve() : (c(g, m, n, r, i, null, a, o, s), setActiveBranch(d, m))) : g && isSameVNodeType(g, f) ? (c(g, f, n, r, i, d, a, o, s), d.resolve(!0)) : (c(null, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0 && d.resolve()));
	else if (g && isSameVNodeType(g, f)) c(g, f, n, r, i, d, a, o, s), setActiveBranch(d, f);
	else if (triggerEvent(t, "onPending"), d.pendingBranch = f, f.shapeFlag & 512 ? d.pendingId = f.component.suspenseId : d.pendingId = suspenseId++, c(null, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0) d.resolve();
	else {
		let { timeout: e, pendingId: t } = d;
		e > 0 ? setTimeout(() => {
			d.pendingId === t && d.fallback(m);
		}, e) : e === 0 && d.fallback(m);
	}
}
function createSuspenseBoundary(e, t, n, r, i, a, o, s, c, l, u = !1) {
	let { p: d, m: f, um: m, n: g, o: { parentNode: _, remove: v } } = l, y, b = isVNodeSuspensible(e);
	b && t && t.pendingBranch && (y = t.pendingId, t.deps++);
	let x = e.props ? toNumber(e.props.timeout) : void 0, S = a, C = {
		vnode: e,
		parent: t,
		parentComponent: n,
		namespace: o,
		container: r,
		hiddenContainer: i,
		deps: 0,
		pendingId: suspenseId++,
		timeout: typeof x == "number" ? x : -1,
		activeBranch: null,
		pendingBranch: null,
		isInFallback: !u,
		isHydrating: u,
		isUnmounted: !1,
		effects: [],
		resolve(e = !1, n = !1) {
			let { vnode: r, activeBranch: i, pendingBranch: o, pendingId: s, effects: c, parentComponent: l, container: u, isInFallback: d } = C, v = !1;
			C.isHydrating ? C.isHydrating = !1 : e || (v = i && o.transition && o.transition.mode === "out-in", v && (i.transition.afterLeave = () => {
				s === C.pendingId && (f(o, u, a === S ? g(i) : a, 0), queuePostFlushCb(c), d && r.ssFallback && (r.ssFallback.el = null));
			}), i && (_(i.el) === u && (a = g(i)), m(i, l, C, !0), !v && d && r.ssFallback && queuePostRenderEffect(() => r.ssFallback.el = null, C)), v || f(o, u, a, 0)), setActiveBranch(C, o), C.pendingBranch = null, C.isInFallback = !1;
			let x = C.parent, w = !1;
			for (; x;) {
				if (x.pendingBranch) {
					x.effects.push(...c), w = !0;
					break;
				}
				x = x.parent;
			}
			!w && !v && queuePostFlushCb(c), C.effects = [], b && t && t.pendingBranch && y === t.pendingId && (t.deps--, t.deps === 0 && !n && t.resolve()), triggerEvent(r, "onResolve");
		},
		fallback(e) {
			if (!C.pendingBranch) return;
			let { vnode: t, activeBranch: n, parentComponent: r, container: i, namespace: a } = C;
			triggerEvent(t, "onFallback");
			let o = g(n), l = () => {
				C.isInFallback && (d(null, e, i, o, r, null, a, s, c), setActiveBranch(C, e));
			}, u = e.transition && e.transition.mode === "out-in";
			u && (n.transition.afterLeave = l), C.isInFallback = !0, m(n, r, null, !0), u || l();
		},
		move(e, t, n) {
			C.activeBranch && f(C.activeBranch, e, t, n), C.container = e;
		},
		next() {
			return C.activeBranch && g(C.activeBranch);
		},
		registerDep(e, t, n) {
			let r = !!C.pendingBranch;
			r && C.deps++;
			let i = e.vnode.el;
			e.asyncDep.catch((t) => {
				handleError(t, e, 0);
			}).then((a) => {
				if (e.isUnmounted || C.isUnmounted || C.pendingId !== e.suspenseId) return;
				e.asyncResolved = !0;
				let { vnode: s } = e;
				handleSetupResult(e, a, !1), i && (s.el = i);
				let c = !i && e.subTree.el;
				t(e, s, _(i || e.subTree.el), i ? null : g(e.subTree), C, o, n), c && (s.placeholder = null, v(c)), updateHOCHostEl(e, s.el), r && --C.deps === 0 && C.resolve();
			});
		},
		unmount(e, t) {
			C.isUnmounted = !0, C.activeBranch && m(C.activeBranch, n, e, t), C.pendingBranch && m(C.pendingBranch, n, e, t);
		}
	};
	return C;
}
function hydrateSuspense(e, t, n, r, i, a, o, s, c) {
	let l = t.suspense = createSuspenseBoundary(t, r, n, e.parentNode, document.createElement("div"), null, i, a, o, s, !0), u = c(e, l.pendingBranch = t.ssContent, n, l, a, o);
	return l.deps === 0 && l.resolve(!1, !0), u;
}
function normalizeSuspenseChildren(e) {
	let { shapeFlag: t, children: n } = e, r = t & 32;
	e.ssContent = normalizeSuspenseSlot(r ? n.default : n), e.ssFallback = r ? normalizeSuspenseSlot(n.fallback) : createVNode(Comment);
}
function normalizeSuspenseSlot(e) {
	let t;
	if (isFunction(e)) {
		let n = isBlockTreeEnabled && e._c;
		n && (e._d = !1, openBlock()), e = e(), n && (e._d = !0, t = currentBlock, closeBlock());
	}
	return isArray(e) && (e = filterSingleRoot(e)), e = normalizeVNode(e), t && !e.dynamicChildren && (e.dynamicChildren = t.filter((t) => t !== e)), e;
}
function queueEffectWithSuspense(e, t) {
	t && t.pendingBranch ? isArray(e) ? t.effects.push(...e) : t.effects.push(e) : queuePostFlushCb(e);
}
function setActiveBranch(e, t) {
	e.activeBranch = t;
	let { vnode: n, parentComponent: r } = e, i = t.el;
	for (; !i && t.component;) t = t.component.subTree, i = t.el;
	n.el = i, r && r.subTree === n && (r.vnode.el = i, updateHOCHostEl(r, i));
}
function isVNodeSuspensible(e) {
	let t = e.props && e.props.suspensible;
	return t != null && t !== !1;
}
var Fragment = Symbol.for("v-fgt"), Text = Symbol.for("v-txt"), Comment = Symbol.for("v-cmt"), Static = Symbol.for("v-stc"), blockStack = [], currentBlock = null;
function openBlock(e = !1) {
	blockStack.push(currentBlock = e ? null : []);
}
function closeBlock() {
	blockStack.pop(), currentBlock = blockStack[blockStack.length - 1] || null;
}
var isBlockTreeEnabled = 1;
function setBlockTracking(e, t = !1) {
	isBlockTreeEnabled += e, e < 0 && currentBlock && t && (currentBlock.hasOnce = !0);
}
function setupBlock(e) {
	return e.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null, closeBlock(), isBlockTreeEnabled > 0 && currentBlock && currentBlock.push(e), e;
}
function createElementBlock(e, t, n, r, i, a) {
	return setupBlock(createBaseVNode(e, t, n, r, i, a, !0));
}
function createBlock(e, t, n, r, i) {
	return setupBlock(createVNode(e, t, n, r, i, !0));
}
function isVNode(e) {
	return e ? e.__v_isVNode === !0 : !1;
}
function isSameVNodeType(e, t) {
	return e.type === t.type && e.key === t.key;
}
var normalizeKey = ({ key: e }) => e ?? null, normalizeRef = ({ ref: e, ref_key: t, ref_for: n }) => (typeof e == "number" && (e = "" + e), e == null ? null : isString(e) || isRef(e) || isFunction(e) ? {
	i: currentRenderingInstance,
	r: e,
	k: t,
	f: !!n
} : e);
function createBaseVNode(e, t = null, n = null, r = 0, i = null, a = e === Fragment ? 0 : 1, o = !1, s = !1) {
	let c = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e,
		props: t,
		key: t && normalizeKey(t),
		ref: t && normalizeRef(t),
		scopeId: currentScopeId,
		slotScopeIds: null,
		children: n,
		component: null,
		suspense: null,
		ssContent: null,
		ssFallback: null,
		dirs: null,
		transition: null,
		el: null,
		anchor: null,
		target: null,
		targetStart: null,
		targetAnchor: null,
		staticCount: 0,
		shapeFlag: a,
		patchFlag: r,
		dynamicProps: i,
		dynamicChildren: null,
		appContext: null,
		ctx: currentRenderingInstance
	};
	return s ? (normalizeChildren(c, n), a & 128 && e.normalize(c)) : n && (c.shapeFlag |= isString(n) ? 8 : 16), isBlockTreeEnabled > 0 && !o && currentBlock && (c.patchFlag > 0 || a & 6) && c.patchFlag !== 32 && currentBlock.push(c), c;
}
var createVNode = _createVNode;
function _createVNode(e, t = null, n = null, r = 0, i = null, a = !1) {
	if ((!e || e === NULL_DYNAMIC_COMPONENT) && (e = Comment), isVNode(e)) {
		let r = cloneVNode(e, t, !0);
		return n && normalizeChildren(r, n), isBlockTreeEnabled > 0 && !a && currentBlock && (r.shapeFlag & 6 ? currentBlock[currentBlock.indexOf(e)] = r : currentBlock.push(r)), r.patchFlag = -2, r;
	}
	if (isClassComponent(e) && (e = e.__vccOpts), t) {
		t = guardReactiveProps(t);
		let { class: e, style: n } = t;
		e && !isString(e) && (t.class = normalizeClass(e)), isObject$1(n) && (isProxy(n) && !isArray(n) && (n = extend({}, n)), t.style = normalizeStyle(n));
	}
	let o = isString(e) ? 1 : isSuspense(e) ? 128 : isTeleport(e) ? 64 : isObject$1(e) ? 4 : isFunction(e) ? 2 : 0;
	return createBaseVNode(e, t, n, r, i, o, a, !0);
}
function guardReactiveProps(e) {
	return e ? isProxy(e) || isInternalObject(e) ? extend({}, e) : e : null;
}
function cloneVNode(e, t, n = !1, r = !1) {
	let { props: i, ref: a, patchFlag: o, children: s, transition: c } = e, l = t ? mergeProps(i || {}, t) : i, u = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e.type,
		props: l,
		key: l && normalizeKey(l),
		ref: t && t.ref ? n && a ? isArray(a) ? a.concat(normalizeRef(t)) : [a, normalizeRef(t)] : normalizeRef(t) : a,
		scopeId: e.scopeId,
		slotScopeIds: e.slotScopeIds,
		children: s,
		target: e.target,
		targetStart: e.targetStart,
		targetAnchor: e.targetAnchor,
		staticCount: e.staticCount,
		shapeFlag: e.shapeFlag,
		patchFlag: t && e.type !== Fragment ? o === -1 ? 16 : o | 16 : o,
		dynamicProps: e.dynamicProps,
		dynamicChildren: e.dynamicChildren,
		appContext: e.appContext,
		dirs: e.dirs,
		transition: c,
		component: e.component,
		suspense: e.suspense,
		ssContent: e.ssContent && cloneVNode(e.ssContent),
		ssFallback: e.ssFallback && cloneVNode(e.ssFallback),
		placeholder: e.placeholder,
		el: e.el,
		anchor: e.anchor,
		ctx: e.ctx,
		ce: e.ce
	};
	return c && r && setTransitionHooks(u, c.clone(u)), u;
}
function createTextVNode(e = " ", t = 0) {
	return createVNode(Text, null, e, t);
}
function createCommentVNode(e = "", t = !1) {
	return t ? (openBlock(), createBlock(Comment, null, e)) : createVNode(Comment, null, e);
}
function normalizeVNode(e) {
	return e == null || typeof e == "boolean" ? createVNode(Comment) : isArray(e) ? createVNode(Fragment, null, e.slice()) : isVNode(e) ? cloneIfMounted(e) : createVNode(Text, null, String(e));
}
function cloneIfMounted(e) {
	return e.el === null && e.patchFlag !== -1 || e.memo ? e : cloneVNode(e);
}
function normalizeChildren(e, t) {
	let n = 0, { shapeFlag: r } = e;
	if (t == null) t = null;
	else if (isArray(t)) n = 16;
	else if (typeof t == "object") if (r & 65) {
		let n = t.default;
		n && (n._c && (n._d = !1), normalizeChildren(e, n()), n._c && (n._d = !0));
		return;
	} else {
		n = 32;
		let r = t._;
		!r && !isInternalObject(t) ? t._ctx = currentRenderingInstance : r === 3 && currentRenderingInstance && (currentRenderingInstance.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
	}
	else isFunction(t) ? (t = {
		default: t,
		_ctx: currentRenderingInstance
	}, n = 32) : (t = String(t), r & 64 ? (n = 16, t = [createTextVNode(t)]) : n = 8);
	e.children = t, e.shapeFlag |= n;
}
function mergeProps(...e) {
	let t = {};
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		for (let e in r) if (e === "class") t.class !== r.class && (t.class = normalizeClass([t.class, r.class]));
		else if (e === "style") t.style = normalizeStyle([t.style, r.style]);
		else if (isOn(e)) {
			let n = t[e], i = r[e];
			i && n !== i && !(isArray(n) && n.includes(i)) && (t[e] = n ? [].concat(n, i) : i);
		} else e !== "" && (t[e] = r[e]);
	}
	return t;
}
function invokeVNodeHook(e, t, n, r = null) {
	callWithAsyncErrorHandling(e, t, 7, [n, r]);
}
var emptyAppContext = createAppContext(), uid = 0;
function createComponentInstance(e, n, r) {
	let i = e.type, a = (n ? n.appContext : e.appContext) || emptyAppContext, o = {
		uid: uid++,
		vnode: e,
		type: i,
		parent: n,
		appContext: a,
		root: null,
		next: null,
		subTree: null,
		effect: null,
		update: null,
		job: null,
		scope: new EffectScope(!0),
		render: null,
		proxy: null,
		exposed: null,
		exposeProxy: null,
		withProxy: null,
		provides: n ? n.provides : Object.create(a.provides),
		ids: n ? n.ids : [
			"",
			0,
			0
		],
		accessCache: null,
		renderCache: [],
		components: null,
		directives: null,
		propsOptions: normalizePropsOptions(i, a),
		emitsOptions: normalizeEmitsOptions(i, a),
		emit: null,
		emitted: null,
		propsDefaults: EMPTY_OBJ,
		inheritAttrs: i.inheritAttrs,
		ctx: EMPTY_OBJ,
		data: EMPTY_OBJ,
		props: EMPTY_OBJ,
		attrs: EMPTY_OBJ,
		slots: EMPTY_OBJ,
		refs: EMPTY_OBJ,
		setupState: EMPTY_OBJ,
		setupContext: null,
		suspense: r,
		suspenseId: r ? r.pendingId : 0,
		asyncDep: null,
		asyncResolved: !1,
		isMounted: !1,
		isUnmounted: !1,
		isDeactivated: !1,
		bc: null,
		c: null,
		bm: null,
		m: null,
		bu: null,
		u: null,
		um: null,
		bum: null,
		da: null,
		a: null,
		rtg: null,
		rtc: null,
		ec: null,
		sp: null
	};
	return o.ctx = { _: o }, o.root = n ? n.root : o, o.emit = emit.bind(null, o), e.ce && e.ce(o), o;
}
var currentInstance = null, getCurrentInstance = () => currentInstance || currentRenderingInstance, internalSetCurrentInstance, setInSSRSetupState;
{
	let e = getGlobalThis(), t = (t, n) => {
		let r;
		return (r = e[t]) || (r = e[t] = []), r.push(n), (e) => {
			r.length > 1 ? r.forEach((t) => t(e)) : r[0](e);
		};
	};
	internalSetCurrentInstance = t("__VUE_INSTANCE_SETTERS__", (e) => currentInstance = e), setInSSRSetupState = t("__VUE_SSR_SETTERS__", (e) => isInSSRComponentSetup = e);
}
var setCurrentInstance = (e) => {
	let t = currentInstance;
	return internalSetCurrentInstance(e), e.scope.on(), () => {
		e.scope.off(), internalSetCurrentInstance(t);
	};
}, unsetCurrentInstance = () => {
	currentInstance && currentInstance.scope.off(), internalSetCurrentInstance(null);
};
function isStatefulComponent(e) {
	return e.vnode.shapeFlag & 4;
}
var isInSSRComponentSetup = !1;
function setupComponent(e, t = !1, n = !1) {
	t && setInSSRSetupState(t);
	let { props: r, children: i } = e.vnode, a = isStatefulComponent(e);
	initProps(e, r, a, t), initSlots(e, i, n || t);
	let o = a ? setupStatefulComponent(e, t) : void 0;
	return t && setInSSRSetupState(!1), o;
}
function setupStatefulComponent(e, t) {
	let n = e.type;
	e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, PublicInstanceProxyHandlers);
	let { setup: r } = n;
	if (r) {
		pauseTracking();
		let n = e.setupContext = r.length > 1 ? createSetupContext(e) : null, i = setCurrentInstance(e), a = callWithErrorHandling(r, e, 0, [e.props, n]), o = isPromise(a);
		if (resetTracking(), i(), (o || e.sp) && !isAsyncWrapper(e) && markAsyncBoundary(e), o) {
			if (a.then(unsetCurrentInstance, unsetCurrentInstance), t) return a.then((n) => {
				handleSetupResult(e, n, t);
			}).catch((t) => {
				handleError(t, e, 0);
			});
			e.asyncDep = a;
		} else handleSetupResult(e, a, t);
	} else finishComponentSetup(e, t);
}
function handleSetupResult(e, t, n) {
	isFunction(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : isObject$1(t) && (e.setupState = proxyRefs(t)), finishComponentSetup(e, n);
}
var compile, installWithProxy;
function finishComponentSetup(e, t, n) {
	let i = e.type;
	if (!e.render) {
		if (!t && compile && !i.render) {
			let t = i.template || resolveMergedOptions(e).template;
			if (t) {
				let { isCustomElement: n, compilerOptions: r } = e.appContext.config, { delimiters: a, compilerOptions: o } = i;
				i.render = compile(t, extend(extend({
					isCustomElement: n,
					delimiters: a
				}, r), o));
			}
		}
		e.render = i.render || NOOP, installWithProxy && installWithProxy(e);
	}
	{
		let t = setCurrentInstance(e);
		pauseTracking();
		try {
			applyOptions(e);
		} finally {
			resetTracking(), t();
		}
	}
}
var attrsProxyHandlers = { get(e, t) {
	return track(e, "get", ""), e[t];
} };
function createSetupContext(e) {
	return {
		attrs: new Proxy(e.attrs, attrsProxyHandlers),
		slots: e.slots,
		emit: e.emit,
		expose: (t) => {
			e.exposed = t || {};
		}
	};
}
function getComponentPublicInstance(e) {
	return e.exposed ? e.exposeProxy ||= new Proxy(proxyRefs(markRaw(e.exposed)), {
		get(t, n) {
			if (n in t) return t[n];
			if (n in publicPropertiesMap) return publicPropertiesMap[n](e);
		},
		has(e, t) {
			return t in e || t in publicPropertiesMap;
		}
	}) : e.proxy;
}
function isClassComponent(e) {
	return isFunction(e) && "__vccOpts" in e;
}
var computed = (e, t) => computed$1(e, t, isInSSRComponentSetup);
function h(e, t, n) {
	try {
		setBlockTracking(-1);
		let r = arguments.length;
		return r === 2 ? isObject$1(t) && !isArray(t) ? isVNode(t) ? createVNode(e, null, [t]) : createVNode(e, t) : createVNode(e, null, t) : (r > 3 ? n = Array.prototype.slice.call(arguments, 2) : r === 3 && isVNode(n) && (n = [n]), createVNode(e, t, n));
	} finally {
		setBlockTracking(1);
	}
}
var version = "3.5.25", policy = void 0, tt = typeof window < "u" && window.trustedTypes;
if (tt) try {
	policy = /* @__PURE__ */ tt.createPolicy("vue", { createHTML: (e) => e });
} catch {}
var unsafeToTrustedHTML = policy ? (e) => policy.createHTML(e) : (e) => e, svgNS = "http://www.w3.org/2000/svg", mathmlNS = "http://www.w3.org/1998/Math/MathML", doc = typeof document < "u" ? document : null, templateContainer = doc && /* @__PURE__ */ doc.createElement("template"), nodeOps = {
	insert: (e, t, n) => {
		t.insertBefore(e, n || null);
	},
	remove: (e) => {
		let t = e.parentNode;
		t && t.removeChild(e);
	},
	createElement: (e, t, n, r) => {
		let i = t === "svg" ? doc.createElementNS(svgNS, e) : t === "mathml" ? doc.createElementNS(mathmlNS, e) : n ? doc.createElement(e, { is: n }) : doc.createElement(e);
		return e === "select" && r && r.multiple != null && i.setAttribute("multiple", r.multiple), i;
	},
	createText: (e) => doc.createTextNode(e),
	createComment: (e) => doc.createComment(e),
	setText: (e, t) => {
		e.nodeValue = t;
	},
	setElementText: (e, t) => {
		e.textContent = t;
	},
	parentNode: (e) => e.parentNode,
	nextSibling: (e) => e.nextSibling,
	querySelector: (e) => doc.querySelector(e),
	setScopeId(e, t) {
		e.setAttribute(t, "");
	},
	insertStaticContent(e, t, n, r, i, a) {
		let o = n ? n.previousSibling : t.lastChild;
		if (i && (i === a || i.nextSibling)) for (; t.insertBefore(i.cloneNode(!0), n), !(i === a || !(i = i.nextSibling)););
		else {
			templateContainer.innerHTML = unsafeToTrustedHTML(r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e);
			let i = templateContainer.content;
			if (r === "svg" || r === "mathml") {
				let e = i.firstChild;
				for (; e.firstChild;) i.appendChild(e.firstChild);
				i.removeChild(e);
			}
			t.insertBefore(i, n);
		}
		return [o ? o.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild];
	}
}, TRANSITION = "transition", ANIMATION = "animation", vtcKey = Symbol("_vtc"), DOMTransitionPropsValidators = {
	name: String,
	type: String,
	css: {
		type: Boolean,
		default: !0
	},
	duration: [
		String,
		Number,
		Object
	],
	enterFromClass: String,
	enterActiveClass: String,
	enterToClass: String,
	appearFromClass: String,
	appearActiveClass: String,
	appearToClass: String,
	leaveFromClass: String,
	leaveActiveClass: String,
	leaveToClass: String
}, TransitionPropsValidators = /* @__PURE__ */ extend({}, BaseTransitionPropsValidators, DOMTransitionPropsValidators), Transition = /* @__PURE__ */ ((e) => (e.displayName = "Transition", e.props = TransitionPropsValidators, e))((e, { slots: t }) => h(BaseTransition, resolveTransitionProps(e), t)), callHook = (e, t = []) => {
	isArray(e) ? e.forEach((e) => e(...t)) : e && e(...t);
}, hasExplicitCallback = (e) => e ? isArray(e) ? e.some((e) => e.length > 1) : e.length > 1 : !1;
function resolveTransitionProps(e) {
	let t = {};
	for (let n in e) n in DOMTransitionPropsValidators || (t[n] = e[n]);
	if (e.css === !1) return t;
	let { name: n = "v", type: r, duration: i, enterFromClass: a = `${n}-enter-from`, enterActiveClass: o = `${n}-enter-active`, enterToClass: c = `${n}-enter-to`, appearFromClass: l = a, appearActiveClass: u = o, appearToClass: d = c, leaveFromClass: f = `${n}-leave-from`, leaveActiveClass: m = `${n}-leave-active`, leaveToClass: g = `${n}-leave-to` } = e, _ = normalizeDuration(i), v = _ && _[0], y = _ && _[1], { onBeforeEnter: b, onEnter: x, onEnterCancelled: S, onLeave: C, onLeaveCancelled: w, onBeforeAppear: T = b, onAppear: E = x, onAppearCancelled: D = S } = t, O = (e, t, n, r) => {
		e._enterCancelled = r, removeTransitionClass(e, t ? d : c), removeTransitionClass(e, t ? u : o), n && n();
	}, k = (e, t) => {
		e._isLeaving = !1, removeTransitionClass(e, f), removeTransitionClass(e, g), removeTransitionClass(e, m), t && t();
	}, A = (e) => (t, n) => {
		let i = e ? E : x, o = () => O(t, e, n);
		callHook(i, [t, o]), nextFrame(() => {
			removeTransitionClass(t, e ? l : a), addTransitionClass(t, e ? d : c), hasExplicitCallback(i) || whenTransitionEnds(t, r, v, o);
		});
	};
	return extend(t, {
		onBeforeEnter(e) {
			callHook(b, [e]), addTransitionClass(e, a), addTransitionClass(e, o);
		},
		onBeforeAppear(e) {
			callHook(T, [e]), addTransitionClass(e, l), addTransitionClass(e, u);
		},
		onEnter: A(!1),
		onAppear: A(!0),
		onLeave(e, t) {
			e._isLeaving = !0;
			let n = () => k(e, t);
			addTransitionClass(e, f), e._enterCancelled ? (addTransitionClass(e, m), forceReflow(e)) : (forceReflow(e), addTransitionClass(e, m)), nextFrame(() => {
				e._isLeaving && (removeTransitionClass(e, f), addTransitionClass(e, g), hasExplicitCallback(C) || whenTransitionEnds(e, r, y, n));
			}), callHook(C, [e, n]);
		},
		onEnterCancelled(e) {
			O(e, !1, void 0, !0), callHook(S, [e]);
		},
		onAppearCancelled(e) {
			O(e, !0, void 0, !0), callHook(D, [e]);
		},
		onLeaveCancelled(e) {
			k(e), callHook(w, [e]);
		}
	});
}
function normalizeDuration(e) {
	if (e == null) return null;
	if (isObject$1(e)) return [NumberOf(e.enter), NumberOf(e.leave)];
	{
		let t = NumberOf(e);
		return [t, t];
	}
}
function NumberOf(e) {
	return toNumber(e);
}
function addTransitionClass(e, t) {
	t.split(/\s+/).forEach((t) => t && e.classList.add(t)), (e[vtcKey] || (e[vtcKey] = /* @__PURE__ */ new Set())).add(t);
}
function removeTransitionClass(e, t) {
	t.split(/\s+/).forEach((t) => t && e.classList.remove(t));
	let n = e[vtcKey];
	n && (n.delete(t), n.size || (e[vtcKey] = void 0));
}
function nextFrame(e) {
	requestAnimationFrame(() => {
		requestAnimationFrame(e);
	});
}
var endId = 0;
function whenTransitionEnds(e, t, n, r) {
	let i = e._endId = ++endId, a = () => {
		i === e._endId && r();
	};
	if (n != null) return setTimeout(a, n);
	let { type: o, timeout: s, propCount: c } = getTransitionInfo(e, t);
	if (!o) return r();
	let l = o + "end", u = 0, d = () => {
		e.removeEventListener(l, f), a();
	}, f = (t) => {
		t.target === e && ++u >= c && d();
	};
	setTimeout(() => {
		u < c && d();
	}, s + 1), e.addEventListener(l, f);
}
function getTransitionInfo(e, t) {
	let n = window.getComputedStyle(e), r = (e) => (n[e] || "").split(", "), i = r(`${TRANSITION}Delay`), a = r(`${TRANSITION}Duration`), o = getTimeout(i, a), s = r(`${ANIMATION}Delay`), c = r(`${ANIMATION}Duration`), l = getTimeout(s, c), u = null, d = 0, f = 0;
	t === TRANSITION ? o > 0 && (u = TRANSITION, d = o, f = a.length) : t === ANIMATION ? l > 0 && (u = ANIMATION, d = l, f = c.length) : (d = Math.max(o, l), u = d > 0 ? o > l ? TRANSITION : ANIMATION : null, f = u ? u === TRANSITION ? a.length : c.length : 0);
	let m = u === TRANSITION && /\b(?:transform|all)(?:,|$)/.test(r(`${TRANSITION}Property`).toString());
	return {
		type: u,
		timeout: d,
		propCount: f,
		hasTransform: m
	};
}
function getTimeout(e, t) {
	for (; e.length < t.length;) e = e.concat(e);
	return Math.max(...t.map((t, n) => toMs(t) + toMs(e[n])));
}
function toMs(e) {
	return e === "auto" ? 0 : Number(e.slice(0, -1).replace(",", ".")) * 1e3;
}
function forceReflow(e) {
	return (e ? e.ownerDocument : document).body.offsetHeight;
}
function patchClass(e, t, n) {
	let r = e[vtcKey];
	r && (t = (t ? [t, ...r] : [...r]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
var vShowOriginalDisplay = Symbol("_vod"), vShowHidden = Symbol("_vsh"), vShow = {
	name: "show",
	beforeMount(e, { value: t }, { transition: n }) {
		e[vShowOriginalDisplay] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : setDisplay(e, t);
	},
	mounted(e, { value: t }, { transition: n }) {
		n && t && n.enter(e);
	},
	updated(e, { value: t, oldValue: n }, { transition: r }) {
		!t != !n && (r ? t ? (r.beforeEnter(e), setDisplay(e, !0), r.enter(e)) : r.leave(e, () => {
			setDisplay(e, !1);
		}) : setDisplay(e, t));
	},
	beforeUnmount(e, { value: t }) {
		setDisplay(e, t);
	}
};
function setDisplay(e, t) {
	e.style.display = t ? e[vShowOriginalDisplay] : "none", e[vShowHidden] = !t;
}
var CSS_VAR_TEXT = Symbol("");
function useCssVars(e) {
	let t = getCurrentInstance();
	if (!t) return;
	let n = t.ut = (n = e(t.proxy)) => {
		Array.from(document.querySelectorAll(`[data-v-owner="${t.uid}"]`)).forEach((e) => setVarsOnNode(e, n));
	}, i = () => {
		let r = e(t.proxy);
		t.ce ? setVarsOnNode(t.ce, r) : setVarsOnVNode(t.subTree, r), n(r);
	};
	onBeforeUpdate(() => {
		queuePostFlushCb(i);
	}), onMounted(() => {
		watch(i, NOOP, { flush: "post" });
		let e = new MutationObserver(i);
		e.observe(t.subTree.el.parentNode, { childList: !0 }), onUnmounted(() => e.disconnect());
	});
}
function setVarsOnVNode(e, t) {
	if (e.shapeFlag & 128) {
		let n = e.suspense;
		e = n.activeBranch, n.pendingBranch && !n.isHydrating && n.effects.push(() => {
			setVarsOnVNode(n.activeBranch, t);
		});
	}
	for (; e.component;) e = e.component.subTree;
	if (e.shapeFlag & 1 && e.el) setVarsOnNode(e.el, t);
	else if (e.type === Fragment) e.children.forEach((e) => setVarsOnVNode(e, t));
	else if (e.type === Static) {
		let { el: n, anchor: r } = e;
		for (; n && (setVarsOnNode(n, t), n !== r);) n = n.nextSibling;
	}
}
function setVarsOnNode(e, t) {
	if (e.nodeType === 1) {
		let n = e.style, r = "";
		for (let e in t) {
			let i = normalizeCssVarValue(t[e]);
			n.setProperty(`--${e}`, i), r += `--${e}: ${i};`;
		}
		n[CSS_VAR_TEXT] = r;
	}
}
var displayRE = /(?:^|;)\s*display\s*:/;
function patchStyle(e, t, n) {
	let r = e.style, i = isString(n), a = !1;
	if (n && !i) {
		if (t) if (isString(t)) for (let e of t.split(";")) {
			let t = e.slice(0, e.indexOf(":")).trim();
			n[t] ?? setStyle(r, t, "");
		}
		else for (let e in t) n[e] ?? setStyle(r, e, "");
		for (let e in n) e === "display" && (a = !0), setStyle(r, e, n[e]);
	} else if (i) {
		if (t !== n) {
			let e = r[CSS_VAR_TEXT];
			e && (n += ";" + e), r.cssText = n, a = displayRE.test(n);
		}
	} else t && e.removeAttribute("style");
	vShowOriginalDisplay in e && (e[vShowOriginalDisplay] = a ? r.display : "", e[vShowHidden] && (r.display = "none"));
}
var importantRE = /\s*!important$/;
function setStyle(e, t, n) {
	if (isArray(n)) n.forEach((n) => setStyle(e, t, n));
	else if (n ??= "", t.startsWith("--")) e.setProperty(t, n);
	else {
		let r = autoPrefix(e, t);
		importantRE.test(n) ? e.setProperty(hyphenate$1(r), n.replace(importantRE, ""), "important") : e[r] = n;
	}
}
var prefixes = [
	"Webkit",
	"Moz",
	"ms"
], prefixCache = {};
function autoPrefix(e, t) {
	let n = prefixCache[t];
	if (n) return n;
	let r = camelize$1(t);
	if (r !== "filter" && r in e) return prefixCache[t] = r;
	r = capitalize(r);
	for (let n = 0; n < prefixes.length; n++) {
		let i = prefixes[n] + r;
		if (i in e) return prefixCache[t] = i;
	}
	return t;
}
var xlinkNS = "http://www.w3.org/1999/xlink";
function patchAttr(e, t, n, r, i, a = isSpecialBooleanAttr(t)) {
	r && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(xlinkNS, t.slice(6, t.length)) : e.setAttributeNS(xlinkNS, t, n) : n == null || a && !includeBooleanAttr(n) ? e.removeAttribute(t) : e.setAttribute(t, a ? "" : isSymbol(n) ? String(n) : n);
}
function patchDOMProp(e, t, n, r, i) {
	if (t === "innerHTML" || t === "textContent") {
		n != null && (e[t] = t === "innerHTML" ? unsafeToTrustedHTML(n) : n);
		return;
	}
	let a = e.tagName;
	if (t === "value" && a !== "PROGRESS" && !a.includes("-")) {
		let r = a === "OPTION" ? e.getAttribute("value") || "" : e.value, i = n == null ? e.type === "checkbox" ? "on" : "" : String(n);
		(r !== i || !("_value" in e)) && (e.value = i), n ?? e.removeAttribute(t), e._value = n;
		return;
	}
	let o = !1;
	if (n === "" || n == null) {
		let r = typeof e[t];
		r === "boolean" ? n = includeBooleanAttr(n) : n == null && r === "string" ? (n = "", o = !0) : r === "number" && (n = 0, o = !0);
	}
	try {
		e[t] = n;
	} catch {}
	o && e.removeAttribute(i || t);
}
function addEventListener(e, t, n, r) {
	e.addEventListener(t, n, r);
}
function removeEventListener(e, t, n, r) {
	e.removeEventListener(t, n, r);
}
var veiKey = Symbol("_vei");
function patchEvent(e, t, n, r, i = null) {
	let a = e[veiKey] || (e[veiKey] = {}), o = a[t];
	if (r && o) o.value = r;
	else {
		let [n, s] = parseName(t);
		r ? addEventListener(e, n, a[t] = createInvoker(r, i), s) : o && (removeEventListener(e, n, o, s), a[t] = void 0);
	}
}
var optionsModifierRE = /(?:Once|Passive|Capture)$/;
function parseName(e) {
	let t;
	if (optionsModifierRE.test(e)) {
		t = {};
		let n;
		for (; n = e.match(optionsModifierRE);) e = e.slice(0, e.length - n[0].length), t[n[0].toLowerCase()] = !0;
	}
	return [e[2] === ":" ? e.slice(3) : hyphenate$1(e.slice(2)), t];
}
var cachedNow = 0, p = /* @__PURE__ */ Promise.resolve(), getNow = () => cachedNow ||= (p.then(() => cachedNow = 0), Date.now());
function createInvoker(e, t) {
	let n = (e) => {
		if (!e._vts) e._vts = Date.now();
		else if (e._vts <= n.attached) return;
		callWithAsyncErrorHandling(patchStopImmediatePropagation(e, n.value), t, 5, [e]);
	};
	return n.value = e, n.attached = getNow(), n;
}
function patchStopImmediatePropagation(e, t) {
	if (isArray(t)) {
		let n = e.stopImmediatePropagation;
		return e.stopImmediatePropagation = () => {
			n.call(e), e._stopped = !0;
		}, t.map((e) => (t) => !t._stopped && e && e(t));
	} else return t;
}
var isNativeOn = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, patchProp = (e, t, n, r, i, s) => {
	let c = i === "svg";
	t === "class" ? patchClass(e, r, c) : t === "style" ? patchStyle(e, n, r) : isOn(t) ? isModelListener(t) || patchEvent(e, t, n, r, s) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : shouldSetAsProp(e, t, r, c)) ? (patchDOMProp(e, t, r), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && patchAttr(e, t, r, c, s, t !== "value")) : e._isVueCE && (/[A-Z]/.test(t) || !isString(r)) ? patchDOMProp(e, camelize$1(t), r, s, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), patchAttr(e, t, r, c));
};
function shouldSetAsProp(e, t, n, r) {
	if (r) return !!(t === "innerHTML" || t === "textContent" || t in e && isNativeOn(t) && isFunction(n));
	if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA") return !1;
	if (t === "width" || t === "height") {
		let t = e.tagName;
		if (t === "IMG" || t === "VIDEO" || t === "CANVAS" || t === "SOURCE") return !1;
	}
	return isNativeOn(t) && isString(n) ? !1 : t in e;
}
var positionMap = /* @__PURE__ */ new WeakMap(), newPositionMap = /* @__PURE__ */ new WeakMap(), moveCbKey = Symbol("_moveCb"), enterCbKey = Symbol("_enterCb"), TransitionGroup = /* @__PURE__ */ ((e) => (delete e.props.mode, e))({
	name: "TransitionGroup",
	props: /* @__PURE__ */ extend({}, TransitionPropsValidators, {
		tag: String,
		moveClass: String
	}),
	setup(e, { slots: t }) {
		let n = getCurrentInstance(), r = useTransitionState(), i, a;
		return onUpdated(() => {
			if (!i.length) return;
			let t = e.moveClass || `${e.name || "v"}-move`;
			if (!hasCSSTransform(i[0].el, n.vnode.el, t)) {
				i = [];
				return;
			}
			i.forEach(callPendingCbs), i.forEach(recordPosition);
			let r = i.filter(applyTranslation);
			forceReflow(n.vnode.el), r.forEach((e) => {
				let n = e.el, r = n.style;
				addTransitionClass(n, t), r.transform = r.webkitTransform = r.transitionDuration = "";
				let i = n[moveCbKey] = (e) => {
					e && e.target !== n || (!e || e.propertyName.endsWith("transform")) && (n.removeEventListener("transitionend", i), n[moveCbKey] = null, removeTransitionClass(n, t));
				};
				n.addEventListener("transitionend", i);
			}), i = [];
		}), () => {
			let o = toRaw(e), s = resolveTransitionProps(o), c = o.tag || Fragment;
			if (i = [], a) for (let e = 0; e < a.length; e++) {
				let t = a[e];
				t.el && t.el instanceof Element && (i.push(t), setTransitionHooks(t, resolveTransitionHooks(t, s, r, n)), positionMap.set(t, {
					left: t.el.offsetLeft,
					top: t.el.offsetTop
				}));
			}
			a = t.default ? getTransitionRawChildren(t.default()) : [];
			for (let e = 0; e < a.length; e++) {
				let t = a[e];
				t.key != null && setTransitionHooks(t, resolveTransitionHooks(t, s, r, n));
			}
			return createVNode(c, null, a);
		};
	}
});
function callPendingCbs(e) {
	let t = e.el;
	t[moveCbKey] && t[moveCbKey](), t[enterCbKey] && t[enterCbKey]();
}
function recordPosition(e) {
	newPositionMap.set(e, {
		left: e.el.offsetLeft,
		top: e.el.offsetTop
	});
}
function applyTranslation(e) {
	let t = positionMap.get(e), n = newPositionMap.get(e), r = t.left - n.left, i = t.top - n.top;
	if (r || i) {
		let t = e.el.style;
		return t.transform = t.webkitTransform = `translate(${r}px,${i}px)`, t.transitionDuration = "0s", e;
	}
}
function hasCSSTransform(e, t, n) {
	let r = e.cloneNode(), i = e[vtcKey];
	i && i.forEach((e) => {
		e.split(/\s+/).forEach((e) => e && r.classList.remove(e));
	}), n.split(/\s+/).forEach((e) => e && r.classList.add(e)), r.style.display = "none";
	let a = t.nodeType === 1 ? t : t.parentNode;
	a.appendChild(r);
	let { hasTransform: o } = getTransitionInfo(r);
	return a.removeChild(r), o;
}
var rendererOptions = /* @__PURE__ */ extend({ patchProp }, nodeOps), renderer;
function ensureRenderer() {
	return renderer ||= createRenderer(rendererOptions);
}
var createApp = ((...e) => {
	let t = ensureRenderer().createApp(...e), { mount: n } = t;
	return t.mount = (e) => {
		let r = normalizeContainer(e);
		if (!r) return;
		let i = t._component;
		!isFunction(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
		let a = n(r, !1, resolveRootNamespace(r));
		return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), a;
	}, t;
});
function resolveRootNamespace(e) {
	if (e instanceof SVGElement) return "svg";
	if (typeof MathMLElement == "function" && e instanceof MathMLElement) return "mathml";
}
function normalizeContainer(e) {
	return isString(e) ? document.querySelector(e) : e;
}
var IS_CLIENT = typeof window < "u", activePinia, setActivePinia = (e) => activePinia = e, piniaSymbol = Symbol();
function isPlainObject(e) {
	return e && typeof e == "object" && Object.prototype.toString.call(e) === "[object Object]" && typeof e.toJSON != "function";
}
var MutationType;
(function(e) {
	e.direct = "direct", e.patchObject = "patch object", e.patchFunction = "patch function";
})(MutationType ||= {});
var _global = /* @__PURE__ */ (() => typeof window == "object" && window.window === window ? window : typeof self == "object" && self.self === self ? self : typeof global == "object" && global.global === global ? global : typeof globalThis == "object" ? globalThis : { HTMLElement: null })();
function bom(e, { autoBom: t = !1 } = {}) {
	return t && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type) ? new Blob(["﻿", e], { type: e.type }) : e;
}
function download(e, t, n) {
	let r = new XMLHttpRequest();
	r.open("GET", e), r.responseType = "blob", r.onload = function() {
		saveAs(r.response, t, n);
	}, r.onerror = function() {
		console.error("could not download file");
	}, r.send();
}
function corsEnabled(e) {
	let t = new XMLHttpRequest();
	t.open("HEAD", e, !1);
	try {
		t.send();
	} catch {}
	return t.status >= 200 && t.status <= 299;
}
function click(e) {
	try {
		e.dispatchEvent(new MouseEvent("click"));
	} catch {
		let t = new MouseEvent("click", {
			bubbles: !0,
			cancelable: !0,
			view: window,
			detail: 0,
			screenX: 80,
			screenY: 20,
			clientX: 80,
			clientY: 20,
			ctrlKey: !1,
			altKey: !1,
			shiftKey: !1,
			metaKey: !1,
			button: 0,
			relatedTarget: null
		});
		e.dispatchEvent(t);
	}
}
var _navigator = typeof navigator == "object" ? navigator : { userAgent: "" }, isMacOSWebView = /* @__PURE__ */ (() => /Macintosh/.test(_navigator.userAgent) && /AppleWebKit/.test(_navigator.userAgent) && !/Safari/.test(_navigator.userAgent))(), saveAs = IS_CLIENT ? typeof HTMLAnchorElement < "u" && "download" in HTMLAnchorElement.prototype && !isMacOSWebView ? downloadSaveAs : "msSaveOrOpenBlob" in _navigator ? msSaveAs : fileSaverSaveAs : () => {};
function downloadSaveAs(e, t = "download", n) {
	let r = document.createElement("a");
	r.download = t, r.rel = "noopener", typeof e == "string" ? (r.href = e, r.origin === location.origin ? click(r) : corsEnabled(r.href) ? download(e, t, n) : (r.target = "_blank", click(r))) : (r.href = URL.createObjectURL(e), setTimeout(function() {
		URL.revokeObjectURL(r.href);
	}, 4e4), setTimeout(function() {
		click(r);
	}, 0));
}
function msSaveAs(e, t = "download", n) {
	if (typeof e == "string") if (corsEnabled(e)) download(e, t, n);
	else {
		let t = document.createElement("a");
		t.href = e, t.target = "_blank", setTimeout(function() {
			click(t);
		});
	}
	else navigator.msSaveOrOpenBlob(bom(e, n), t);
}
function fileSaverSaveAs(e, t, n, r) {
	if (r ||= open("", "_blank"), r && (r.document.title = r.document.body.innerText = "downloading..."), typeof e == "string") return download(e, t, n);
	let i = e.type === "application/octet-stream", a = /constructor/i.test(String(_global.HTMLElement)) || "safari" in _global, o = /CriOS\/[\d]+/.test(navigator.userAgent);
	if ((o || i && a || isMacOSWebView) && typeof FileReader < "u") {
		let t = new FileReader();
		t.onloadend = function() {
			let e = t.result;
			if (typeof e != "string") throw r = null, Error("Wrong reader.result type");
			e = o ? e : e.replace(/^data:[^;]*;/, "data:attachment/file;"), r ? r.location.href = e : location.assign(e), r = null;
		}, t.readAsDataURL(e);
	} else {
		let t = URL.createObjectURL(e);
		r ? r.location.assign(t) : location.href = t, r = null, setTimeout(function() {
			URL.revokeObjectURL(t);
		}, 4e4);
	}
}
var { assign: assign$1 } = Object;
function createPinia() {
	let e = effectScope(!0), t = e.run(() => ref({})), n = [], r = [], i = markRaw({
		install(e) {
			setActivePinia(i), i._a = e, e.provide(piniaSymbol, i), e.config.globalProperties.$pinia = i, r.forEach((e) => n.push(e)), r = [];
		},
		use(e) {
			return this._a ? n.push(e) : r.push(e), this;
		},
		_p: n,
		_a: null,
		_e: e,
		_s: /* @__PURE__ */ new Map(),
		state: t
	});
	return i;
}
var noop$1 = () => {};
function addSubscription(e, t, n, r = noop$1) {
	e.add(t);
	let i = () => {
		e.delete(t) && r();
	};
	return !n && getCurrentScope() && onScopeDispose(i), i;
}
function triggerSubscriptions(e, ...t) {
	e.forEach((e) => {
		e(...t);
	});
}
var fallbackRunWithContext = (e) => e(), ACTION_MARKER = Symbol(), ACTION_NAME = Symbol();
function mergeReactiveObjects(e, t) {
	for (let n in e instanceof Map && t instanceof Map ? t.forEach((t, n) => e.set(n, t)) : e instanceof Set && t instanceof Set && t.forEach(e.add, e), t) {
		if (!t.hasOwnProperty(n)) continue;
		let r = t[n], i = e[n];
		isPlainObject(i) && isPlainObject(r) && e.hasOwnProperty(n) && !isRef(r) && !isReactive(r) ? e[n] = mergeReactiveObjects(i, r) : e[n] = r;
	}
	return e;
}
var skipHydrateSymbol = Symbol();
function shouldHydrate(e) {
	return !isPlainObject(e) || !Object.prototype.hasOwnProperty.call(e, skipHydrateSymbol);
}
var { assign } = Object;
function isComputed(e) {
	return !!(isRef(e) && e.effect);
}
function createOptionsStore(e, t, n, r) {
	let { state: i, actions: a, getters: o } = t, s = n.state.value[e], c;
	function l() {
		return s || (n.state.value[e] = i ? i() : {}), assign(toRefs$1(n.state.value[e]), a, Object.keys(o || {}).reduce((t, r) => (t[r] = markRaw(computed(() => {
			setActivePinia(n);
			let t = n._s.get(e);
			return o[r].call(t, t);
		})), t), {}));
	}
	return c = createSetupStore(e, l, t, n, r, !0), c;
}
function createSetupStore(e, t, n = {}, r, i, a) {
	let o, s = assign({ actions: {} }, n), c = { deep: !0 }, l, u, d = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Set(), m = r.state.value[e];
	!a && !m && (r.state.value[e] = {}), ref({});
	let g;
	function _(t) {
		let n;
		l = u = !1, typeof t == "function" ? (t(r.state.value[e]), n = {
			type: MutationType.patchFunction,
			storeId: e,
			events: void 0
		}) : (mergeReactiveObjects(r.state.value[e], t), n = {
			type: MutationType.patchObject,
			payload: t,
			storeId: e,
			events: void 0
		});
		let i = g = Symbol();
		nextTick().then(() => {
			g === i && (l = !0);
		}), u = !0, triggerSubscriptions(d, n, r.state.value[e]);
	}
	let v = a ? function() {
		let { state: e } = n, t = e ? e() : {};
		this.$patch((e) => {
			assign(e, t);
		});
	} : noop$1;
	function y() {
		o.stop(), d.clear(), f.clear(), r._s.delete(e);
	}
	let b = (t, n = "") => {
		if (ACTION_MARKER in t) return t[ACTION_NAME] = n, t;
		let i = function() {
			setActivePinia(r);
			let n = Array.from(arguments), a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set();
			function s(e) {
				a.add(e);
			}
			function c(e) {
				o.add(e);
			}
			triggerSubscriptions(f, {
				args: n,
				name: i[ACTION_NAME],
				store: x,
				after: s,
				onError: c
			});
			let l;
			try {
				l = t.apply(this && this.$id === e ? this : x, n);
			} catch (e) {
				throw triggerSubscriptions(o, e), e;
			}
			return l instanceof Promise ? l.then((e) => (triggerSubscriptions(a, e), e)).catch((e) => (triggerSubscriptions(o, e), Promise.reject(e))) : (triggerSubscriptions(a, l), l);
		};
		return i[ACTION_MARKER] = !0, i[ACTION_NAME] = n, i;
	}, x = reactive({
		_p: r,
		$id: e,
		$onAction: addSubscription.bind(null, f),
		$patch: _,
		$reset: v,
		$subscribe(t, n = {}) {
			let i = addSubscription(d, t, n.detached, () => a()), a = o.run(() => watch(() => r.state.value[e], (r) => {
				(n.flush === "sync" ? u : l) && t({
					storeId: e,
					type: MutationType.direct,
					events: void 0
				}, r);
			}, assign({}, c, n)));
			return i;
		},
		$dispose: y
	});
	r._s.set(e, x);
	let S = (r._a && r._a.runWithContext || fallbackRunWithContext)(() => r._e.run(() => (o = effectScope()).run(() => t({ action: b }))));
	for (let t in S) {
		let n = S[t];
		isRef(n) && !isComputed(n) || isReactive(n) ? a || (m && shouldHydrate(n) && (isRef(n) ? n.value = m[t] : mergeReactiveObjects(n, m[t])), r.state.value[e][t] = n) : typeof n == "function" && (S[t] = b(n, t), s.actions[t] = n);
	}
	return assign(x, S), assign(toRaw(x), S), Object.defineProperty(x, "$state", {
		get: () => r.state.value[e],
		set: (e) => {
			_((t) => {
				assign(t, e);
			});
		}
	}), r._p.forEach((e) => {
		assign(x, o.run(() => e({
			store: x,
			app: r._a,
			pinia: r,
			options: s
		})));
	}), m && a && n.hydrate && n.hydrate(x.$state, m), l = !0, u = !0, x;
}
function defineStore(e, t, n) {
	let r, i = typeof t == "function";
	r = i ? n : t;
	function a(n, a) {
		let o = hasInjectionContext();
		return n ||= o ? inject(piniaSymbol, null) : null, n && setActivePinia(n), n = activePinia, n._s.has(e) || (i ? createSetupStore(e, t, r, n) : createOptionsStore(e, r, n)), n._s.get(e);
	}
	return a.$id = e, a;
}
function get(e, t) {
	if (e == null) return;
	let n = e;
	for (let e = 0; e < t.length; e++) {
		if (n === void 0 || n[t[e]] === void 0) return;
		if (n === null || n[t[e]] === null) return null;
		n = n[t[e]];
	}
	return n;
}
function set(e, t, n) {
	if (n.length === 0) return t;
	let r = n[0];
	return n.length > 1 && (t = set(typeof e != "object" || !e || !Object.prototype.hasOwnProperty.call(e, r) ? Number.isInteger(Number(n[1])) ? [] : {} : e[r], t, Array.prototype.slice.call(n, 1))), Number.isInteger(Number(r)) && Array.isArray(e) ? e.slice()[r] : Object.assign({}, e, { [r]: t });
}
function unset(e, t) {
	if (e == null || t.length === 0) return e;
	if (t.length === 1) {
		if (e == null) return e;
		if (Number.isInteger(t[0]) && Array.isArray(e)) return Array.prototype.slice.call(e, 0).splice(t[0], 1);
		let n = {};
		for (let t in e) n[t] = e[t];
		return delete n[t[0]], n;
	}
	if (e[t[0]] == null) {
		if (Number.isInteger(t[0]) && Array.isArray(e)) return Array.prototype.concat.call([], e);
		let n = {};
		for (let t in e) n[t] = e[t];
		return n;
	}
	return set(e, unset(e[t[0]], Array.prototype.slice.call(t, 1)), [t[0]]);
}
function deepPick(e, t) {
	return t.map((e) => e.split(".")).map((t) => [t, get(e, t)]).filter((e) => e[1] !== void 0).reduce((e, t) => set(e, t[1], t[0]), {});
}
function deepOmit(e, t) {
	return t.map((e) => e.split(".")).reduce((e, t) => unset(e, t), e);
}
function hydrateStore(e, { storage: t, serializer: n, key: r, debug: i, pick: a, omit: o, beforeHydrate: s, afterHydrate: c }, l, u = !0) {
	try {
		u && s?.(l);
		let i = t.getItem(r);
		if (i) {
			let t = n.deserialize(i), r = a ? deepPick(t, a) : t, s = o ? deepOmit(r, o) : r;
			e.$patch(s);
		}
		u && c?.(l);
	} catch (e) {
		i && console.error("[pinia-plugin-persistedstate]", e);
	}
}
function persistState(e, { storage: t, serializer: n, key: r, debug: i, pick: a, omit: o }) {
	try {
		let i = a ? deepPick(e, a) : e, s = o ? deepOmit(i, o) : i, c = n.serialize(s);
		t.setItem(r, c);
	} catch (e) {
		i && console.error("[pinia-plugin-persistedstate]", e);
	}
}
function parsePersistKey(e, t) {
	return typeof e == "function" ? e(t) : typeof e == "string" ? e : t;
}
function createPersistence(e, t, n) {
	let { pinia: r, store: i, options: { persist: a = n } } = e;
	if (!a) return;
	// v8 ignore if -- @preserve
	if (!(i.$id in r.state.value)) {
		let e = r._s.get(i.$id.replace("__hot:", ""));
		e && Promise.resolve().then(() => e.$persist());
		return;
	}
	let o = (Array.isArray(a) ? a : a === !0 ? [{}] : [a]).map(t);
	i.$hydrate = ({ runHooks: t = !0 } = {}) => {
		o.forEach((n) => {
			hydrateStore(i, n, e, t);
		});
	}, i.$persist = () => {
		o.forEach((e) => {
			persistState(i.$state, e);
		});
	}, o.forEach((t) => {
		hydrateStore(i, t, e), i.$subscribe((e, n) => persistState(n, t), { detached: !0 });
	});
}
function createPersistedState(e = {}) {
	return function(t) {
		createPersistence(t, (n) => {
			let r = parsePersistKey(n.key, t.store.$id);
			return {
				key: (e.key ? e.key : (e) => e)(r),
				debug: n.debug ?? e.debug ?? !1,
				serializer: n.serializer ?? e.serializer ?? {
					serialize: (e) => JSON.stringify(e),
					deserialize: (e) => JSON.parse(e)
				},
				storage: n.storage ?? e.storage ?? window.localStorage,
				beforeHydrate: n.beforeHydrate ?? e.beforeHydrate,
				afterHydrate: n.afterHydrate ?? e.afterHydrate,
				pick: n.pick,
				omit: n.omit
			};
		}, e.auto ?? !1);
	};
}
var src_default = createPersistedState(), suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/, suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/, JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(e, t) {
	if (e === "__proto__" || e === "constructor" && t && typeof t == "object" && "prototype" in t) {
		warnKeyDropped(e);
		return;
	}
	return t;
}
function warnKeyDropped(e) {
	console.warn(`[destr] Dropping "${e}" key to prevent prototype pollution.`);
}
function destr(e, t = {}) {
	if (typeof e != "string") return e;
	if (e[0] === "\"" && e[e.length - 1] === "\"" && e.indexOf("\\") === -1) return e.slice(1, -1);
	let n = e.trim();
	if (n.length <= 9) switch (n.toLowerCase()) {
		case "true": return !0;
		case "false": return !1;
		case "undefined": return;
		case "null": return null;
		case "nan": return NaN;
		case "infinity": return Infinity;
		case "-infinity": return -Infinity;
	}
	if (!JsonSigRx.test(e)) {
		if (t.strict) throw SyntaxError("[destr] Invalid JSON");
		return e;
	}
	try {
		if (suspectProtoRx.test(e) || suspectConstructorRx.test(e)) {
			if (t.strict) throw Error("[destr] Possible prototype pollution");
			return JSON.parse(e, jsonParseTransform);
		}
		return JSON.parse(e);
	} catch (n) {
		if (t.strict) throw n;
		return e;
	}
}
function mitt_default(e) {
	return {
		all: e ||= /* @__PURE__ */ new Map(),
		on: function(t, n) {
			var r = e.get(t);
			r ? r.push(n) : e.set(t, [n]);
		},
		off: function(t, n) {
			var r = e.get(t);
			r && (n ? r.splice(r.indexOf(n) >>> 0, 1) : e.set(t, []));
		},
		emit: function(t, n) {
			var r = e.get(t);
			r && r.slice().map(function(e) {
				e(n);
			}), (r = e.get("*")) && r.slice().map(function(e) {
				e(t, n);
			});
		}
	};
}
const REFRESH_PLAY_STATE_EVENT = Symbol("refresh-play-state"), emitter = mitt_default();
var PlayList = class {
	url;
	playlist;
	accessibleURL;
	index;
	lastIdx;
	name;
	sIndex;
	_type;
	constructor(e, t, n) {
		this._type = "playlist", this.url = e ?? "", this.playlist = [], this.index = 0, this.lastIdx = 0, this.name = t ?? "", this.sIndex = n ?? 0;
	}
	parserURL() {
		let e = null;
		if ([
			[
				"music.163.com.*song.*id=(\\d+)",
				"netease",
				"song"
			],
			[
				"music.163.com.*album.*id=(\\d+)",
				"netease",
				"album"
			],
			[
				"music.163.com.*artist.*id=(\\d+)",
				"netease",
				"artist"
			],
			[
				"music.163.com.*playlist.*id=(\\d+)",
				"netease",
				"playlist"
			],
			[
				"music.163.com.*discover/toplist.*id=(\\d+)",
				"netease",
				"playlist"
			],
			[
				"y.qq.com.*song/(\\w+)(.html)?",
				"tencent",
				"song"
			],
			[
				"y.qq.com.*album/(\\w+)(.html)?",
				"tencent",
				"album"
			],
			[
				"y.qq.com.*singer/(\\w+)(.html)?",
				"tencent",
				"artist"
			],
			[
				"y.qq.com.*playsquare/(\\w+)(.html)?",
				"tencent",
				"playlist"
			],
			[
				"y.qq.com.*playlist/(\\w+)(.html)?",
				"tencent",
				"playlist"
			]
		].forEach((t) => {
			if (!t[0]) return;
			let n = new RegExp(t[0]).exec(this.url);
			n != null && n[1] && (e = {
				id: n[1],
				provider: t[1],
				type: t[2]
			});
		}), e) return this.accessibleURL = e, e;
		throw Error(`Unsupported URL: ${this.url}`);
	}
	async fetchPlaylist() {
		if (!this.accessibleURL) throw Error("Playlist URL is not accessible");
		let e = null;
		for (let t = 0; t < 3; t++) try {
			let e = await fetch(`https://api.injahow.cn/meting/?type=${this.accessibleURL.type}&id=${this.accessibleURL.id}&server=${this.accessibleURL.provider}`, {
				headers: { Accept: "application/json" },
				signal: AbortSignal.timeout(1e4)
			});
			if (!e.ok) throw Error(`HTTP error! status: ${e.status}`);
			let t = await e.json();
			if (!Array.isArray(t)) throw Error("Invalid playlist data received");
			this.playlist = t;
			return;
		} catch (n) {
			e = n, console.warn(`Attempt ${t + 1} failed for playlist ${this.name}:`, n), t < 2 && await new Promise((e) => setTimeout(e, Math.min(1e3 * 2 ** t, 5e3)));
		}
		throw Error(`Failed to fetch playlist after 3 attempts: ${e?.message}`);
	}
	getCurrentSong() {
		return this.playlist[this.index];
	}
	getNextSong() {
		return this.lastIdx = this.index, this.index = (this.index + 1) % this.playlist.length, this.getCurrentSong();
	}
	getPrevSong() {
		return this.lastIdx = this.index, this.index = (this.index - 1 + this.playlist.length) % this.playlist.length, this.getCurrentSong();
	}
	getRandSong() {
		return this.lastIdx = this.index, this.index = Math.floor(Math.random() * this.playlist.length), this.getCurrentSong();
	}
	getCycleSong() {
		return this.getCurrentSong();
	}
};
function parse(e) {
	let t = destr(e);
	return t.playlists = t.playlists.map((e) => {
		let t = new PlayList();
		return Object.assign(t, e), t;
	}), t;
}
const usePlayingStore = defineStore("playing", {
	state: () => reactive({
		showPlayer: !1,
		playing: !1,
		currentTime: 0,
		songDuration: 0,
		currentPlaylistIndex: 0,
		playlists: [],
		mode: "order",
		enableVolume: !0,
		lastPage: ""
	}),
	persist: {
		serializer: {
			deserialize: parse,
			serialize: JSON.stringify
		},
		storage: globalThis.sessionStorage
	},
	actions: {
		paused() {
			this.playing = !1;
		},
		start() {
			this.playing = !0;
		},
		toggle() {
			this.playing = !this.playing;
		},
		setCurrentTime(e) {
			this.currentTime = e;
		},
		setCurrentPlaylist(e) {
			this.currentPlaylistIndex = e;
		}
	},
	getters: {
		currentPlaylist(e) {
			return e.playlists[e.currentPlaylistIndex] ?? null;
		},
		currentSong(e) {
			return e.playlists[e.currentPlaylistIndex]?.getCurrentSong?.() ?? null;
		},
		currentPlaylists(e) {
			return e.playlists ?? null;
		}
	}
});
function tryOnScopeDispose(e) {
	return getCurrentScope() ? (onScopeDispose(e), !0) : !1;
}
/* @__NO_SIDE_EFFECTS__ */
function createEventHook() {
	let e = /* @__PURE__ */ new Set(), t = (t) => {
		e.delete(t);
	};
	return {
		on: (n) => {
			e.add(n);
			let r = () => t(n);
			return tryOnScopeDispose(r), { off: r };
		},
		off: t,
		trigger: (...t) => Promise.all(Array.from(e).map((e) => e(...t))),
		clear: () => {
			e.clear();
		}
	};
}
var isClient = typeof window < "u" && typeof document < "u";
typeof WorkerGlobalScope < "u" && globalThis instanceof WorkerGlobalScope;
var toString = Object.prototype.toString, isObject = (e) => toString.call(e) === "[object Object]", noop = () => {}, isIOS = /* @__PURE__ */ getIsIOS();
function getIsIOS() {
	return isClient && (window == null ? void 0 : window.navigator)?.userAgent && (/iP(?:ad|hone|od)/.test(window.navigator.userAgent) || (window == null ? void 0 : window.navigator)?.maxTouchPoints > 2 && /iPad|Macintosh/.test(window == null ? void 0 : window.navigator.userAgent));
}
function toRef(...e) {
	if (e.length !== 1) return toRef$1(...e);
	let t = e[0];
	return typeof t == "function" ? readonly(customRef(() => ({
		get: t,
		set: noop
	}))) : ref(t);
}
function promiseTimeout(e, t = !1, n = "Timeout") {
	return new Promise((r, i) => {
		t ? setTimeout(() => i(n), e) : setTimeout(r, e);
	});
}
function containsProp(e, ...t) {
	return t.some((t) => t in e);
}
function toArray(e) {
	return Array.isArray(e) ? e : [e];
}
function createUntil(e, t = !1) {
	function n(n, { flush: r = "sync", deep: i = !1, timeout: a, throwOnTimeout: o } = {}) {
		let s = null, c = [new Promise((a) => {
			s = watch(e, (e) => {
				n(e) !== t && (s ? s() : nextTick(() => s?.()), a(e));
			}, {
				flush: r,
				deep: i,
				immediate: !0
			});
		})];
		return a != null && c.push(promiseTimeout(a, o).then(() => toValue(e)).finally(() => s?.())), Promise.race(c);
	}
	function r(r, i) {
		if (!isRef(r)) return n((e) => e === r, i);
		let { flush: a = "sync", deep: o = !1, timeout: s, throwOnTimeout: c } = i ?? {}, l = null, u = [new Promise((n) => {
			l = watch([e, r], ([e, r]) => {
				t !== (e === r) && (l ? l() : nextTick(() => l?.()), n(e));
			}, {
				flush: a,
				deep: o,
				immediate: !0
			});
		})];
		return s != null && u.push(promiseTimeout(s, c).then(() => toValue(e)).finally(() => (l?.(), toValue(e)))), Promise.race(u);
	}
	function i(e) {
		return n((e) => !!e, e);
	}
	function a(e) {
		return r(null, e);
	}
	function o(e) {
		return r(void 0, e);
	}
	function s(e) {
		return n(Number.isNaN, e);
	}
	function c(e, t) {
		return n((t) => {
			let n = Array.from(t);
			return n.includes(e) || n.includes(toValue(e));
		}, t);
	}
	function l(e) {
		return u(1, e);
	}
	function u(e = 1, t) {
		let r = -1;
		return n(() => (r += 1, r >= e), t);
	}
	return Array.isArray(toValue(e)) ? {
		toMatch: n,
		toContains: c,
		changed: l,
		changedTimes: u,
		get not() {
			return createUntil(e, !t);
		}
	} : {
		toMatch: n,
		toBe: r,
		toBeTruthy: i,
		toBeNull: a,
		toBeNaN: s,
		toBeUndefined: o,
		changed: l,
		changedTimes: u,
		get not() {
			return createUntil(e, !t);
		}
	};
}
function until(e) {
	return createUntil(e);
}
function useTimeoutFn(e, t, n = {}) {
	let { immediate: r = !0, immediateCallback: i = !1 } = n, a = shallowRef(!1), o;
	function s() {
		o &&= (clearTimeout(o), void 0);
	}
	function c() {
		a.value = !1, s();
	}
	function l(...n) {
		i && e(), s(), a.value = !0, o = setTimeout(() => {
			a.value = !1, o = void 0, e(...n);
		}, toValue(t));
	}
	return r && (a.value = !0, isClient && l()), tryOnScopeDispose(c), {
		isPending: shallowReadonly(a),
		start: l,
		stop: c
	};
}
function watchImmediate(e, t, n) {
	return watch(e, t, {
		...n,
		immediate: !0
	});
}
var defaultWindow = isClient ? window : void 0;
isClient && window.document, isClient && window.navigator, isClient && window.location;
function unrefElement(e) {
	let t = toValue(e);
	return t?.$el ?? t;
}
function useEventListener(...e) {
	let t = [], n = () => {
		t.forEach((e) => e()), t.length = 0;
	}, r = (e, t, n, r) => (e.addEventListener(t, n, r), () => e.removeEventListener(t, n, r)), i = computed(() => {
		let t = toArray(toValue(e[0])).filter((e) => e != null);
		return t.every((e) => typeof e != "string") ? t : void 0;
	}), a = watchImmediate(() => [
		i.value?.map((e) => unrefElement(e)) ?? [defaultWindow].filter((e) => e != null),
		toArray(toValue(i.value ? e[1] : e[0])),
		toArray(unref(i.value ? e[2] : e[1])),
		toValue(i.value ? e[3] : e[2])
	], ([e, i, a, o]) => {
		if (n(), !e?.length || !i?.length || !a?.length) return;
		let s = isObject(o) ? { ...o } : o;
		t.push(...e.flatMap((e) => i.flatMap((t) => a.map((n) => r(e, t, n, s)))));
	}, { flush: "post" });
	return tryOnScopeDispose(n), () => {
		a(), n();
	};
}
var _iOSWorkaround = !1;
function onClickOutside(e, t, n = {}) {
	let { window: r = defaultWindow, ignore: i = [], capture: a = !0, detectIframe: o = !1, controls: s = !1 } = n;
	if (!r) return s ? {
		stop: noop,
		cancel: noop,
		trigger: noop
	} : noop;
	if (isIOS && !_iOSWorkaround) {
		_iOSWorkaround = !0;
		let e = { passive: !0 };
		Array.from(r.document.body.children).forEach((t) => t.addEventListener("click", noop, e)), r.document.documentElement.addEventListener("click", noop, e);
	}
	let c = !0, l = (e) => toValue(i).some((t) => {
		if (typeof t == "string") return Array.from(r.document.querySelectorAll(t)).some((t) => t === e.target || e.composedPath().includes(t));
		{
			let n = unrefElement(t);
			return n && (e.target === n || e.composedPath().includes(n));
		}
	});
	function u(e) {
		let t = toValue(e);
		return t && t.$.subTree.shapeFlag === 16;
	}
	function d(e, t) {
		let n = toValue(e), r = n.$.subTree && n.$.subTree.children;
		return r == null || !Array.isArray(r) ? !1 : r.some((e) => e.el === t.target || t.composedPath().includes(e.el));
	}
	let f = (n) => {
		let r = unrefElement(e);
		if (n.target != null && !(!(r instanceof Element) && u(e) && d(e, n)) && !(!r || r === n.target || n.composedPath().includes(r))) {
			if ("detail" in n && n.detail === 0 && (c = !l(n)), !c) {
				c = !0;
				return;
			}
			t(n);
		}
	}, m = !1, g = [
		useEventListener(r, "click", (e) => {
			m || (m = !0, setTimeout(() => {
				m = !1;
			}, 0), f(e));
		}, {
			passive: !0,
			capture: a
		}),
		useEventListener(r, "pointerdown", (t) => {
			let n = unrefElement(e);
			c = !l(t) && !!(n && !t.composedPath().includes(n));
		}, { passive: !0 }),
		o && useEventListener(r, "blur", (n) => {
			setTimeout(() => {
				let i = unrefElement(e);
				r.document.activeElement?.tagName === "IFRAME" && !i?.contains(r.document.activeElement) && t(n);
			}, 0);
		}, { passive: !0 })
	].filter(Boolean), _ = () => g.forEach((e) => e());
	return s ? {
		stop: _,
		cancel: () => {
			c = !1;
		},
		trigger: (e) => {
			c = !0, f(e), c = !1;
		}
	} : _;
}
var payloadMapping = {
	json: "application/json",
	text: "text/plain"
};
function isFetchOptions(e) {
	return e && containsProp(e, "immediate", "refetch", "initialData", "timeout", "beforeFetch", "afterFetch", "onFetchError", "fetch", "updateDataOnError");
}
function headersToObject(e) {
	return typeof Headers < "u" && e instanceof Headers ? Object.fromEntries(e.entries()) : e;
}
function useFetch(e, ...t) {
	let n = typeof AbortController == "function", r = {}, i = {
		immediate: !0,
		refetch: !1,
		timeout: 0,
		updateDataOnError: !1
	}, a = {
		method: "GET",
		type: "text",
		payload: void 0
	};
	t.length > 0 && (isFetchOptions(t[0]) ? i = {
		...i,
		...t[0]
	} : r = t[0]), t.length > 1 && isFetchOptions(t[1]) && (i = {
		...i,
		...t[1]
	});
	let { fetch: o = defaultWindow?.fetch ?? (globalThis == null ? void 0 : globalThis.fetch), initialData: s, timeout: c } = i, l = /* @__PURE__ */ createEventHook(), u = /* @__PURE__ */ createEventHook(), d = /* @__PURE__ */ createEventHook(), f = shallowRef(!1), m = shallowRef(!1), g = shallowRef(!1), _ = shallowRef(null), v = shallowRef(null), y = shallowRef(null), b = shallowRef(s || null), x = computed(() => n && m.value), S, C, w = (e) => {
		n && (S?.abort(e), S = new AbortController(), S.signal.onabort = () => g.value = !0, r = {
			...r,
			signal: S.signal
		});
	}, T = (e) => {
		m.value = e, f.value = !e;
	};
	c && (C = useTimeoutFn(w, c, { immediate: !1 }));
	let E = 0, D = async (t = !1) => {
		w(), T(!0), y.value = null, _.value = null, g.value = !1, E += 1;
		let n = E, c = {
			method: a.method,
			headers: {}
		}, f = toValue(a.payload);
		if (f) {
			let e = headersToObject(c.headers), t = Object.getPrototypeOf(f);
			!a.payloadType && f && (t === Object.prototype || Array.isArray(t)) && !(f instanceof FormData) && (a.payloadType = "json"), a.payloadType && (e["Content-Type"] = payloadMapping[a.payloadType] ?? a.payloadType), c.body = a.payloadType === "json" ? JSON.stringify(f) : f;
		}
		let m = !1, x = {
			url: toValue(e),
			options: {
				...c,
				...r
			},
			cancel: () => {
				m = !0;
			}
		};
		if (i.beforeFetch && Object.assign(x, await i.beforeFetch(x)), m || !o) return T(!1), Promise.resolve(null);
		let S = null;
		return C && C.start(), o(x.url, {
			...c,
			...x.options,
			headers: {
				...headersToObject(c.headers),
				...headersToObject(x.options?.headers)
			}
		}).then(async (e) => {
			if (v.value = e, _.value = e.status, S = await e.clone()[a.type](), !e.ok) throw b.value = s || null, Error(e.statusText);
			return i.afterFetch && ({data: S} = await i.afterFetch({
				data: S,
				response: e,
				context: x,
				execute: D
			})), b.value = S, l.trigger(e), e;
		}).catch(async (e) => {
			let n = e.message || e.name;
			if (i.onFetchError && ({error: n, data: S} = await i.onFetchError({
				data: S,
				error: e,
				response: v.value,
				context: x,
				execute: D
			})), y.value = n, i.updateDataOnError && (b.value = S), u.trigger(e), t) throw e;
			return null;
		}).finally(() => {
			n === E && T(!1), C && C.stop(), d.trigger(null);
		});
	}, O = toRef(i.refetch);
	watch([O, toRef(e)], ([e]) => e && D(), { deep: !0 });
	let k = {
		isFinished: readonly(f),
		isFetching: readonly(m),
		statusCode: _,
		response: v,
		error: y,
		data: b,
		canAbort: x,
		aborted: g,
		abort: w,
		execute: D,
		onFetchResponse: l.on,
		onFetchError: u.on,
		onFetchFinally: d.on,
		get: A("GET"),
		put: A("PUT"),
		post: A("POST"),
		delete: A("DELETE"),
		patch: A("PATCH"),
		head: A("HEAD"),
		options: A("OPTIONS"),
		json: M("json"),
		text: M("text"),
		blob: M("blob"),
		arrayBuffer: M("arrayBuffer"),
		formData: M("formData")
	};
	function A(e) {
		return (t, n) => {
			if (!m.value) return a.method = e, a.payload = t, a.payloadType = n, isRef(a.payload) && watch([O, toRef(a.payload)], ([e]) => e && D(), { deep: !0 }), {
				...k,
				then(e, t) {
					return j().then(e, t);
				}
			};
		};
	}
	function j() {
		return new Promise((e, t) => {
			until(f).toBe(!0).then(() => e(k)).catch(t);
		});
	}
	function M(e) {
		return () => {
			if (!m.value) return a.type = e, {
				...k,
				then(e, t) {
					return j().then(e, t);
				}
			};
		};
	}
	return i.immediate && Promise.resolve().then(() => D()), {
		...k,
		then(e, t) {
			return j().then(e, t);
		}
	};
}
function debounce(e, t, { signal: n, edges: r } = {}) {
	let i, a = null, o = r != null && r.includes("leading"), s = r == null || r.includes("trailing"), c = () => {
		a !== null && (e.apply(i, a), i = void 0, a = null);
	}, l = () => {
		s && c(), m();
	}, u = null, d = () => {
		u != null && clearTimeout(u), u = setTimeout(() => {
			u = null, l();
		}, t);
	}, f = () => {
		u !== null && (clearTimeout(u), u = null);
	}, m = () => {
		f(), i = void 0, a = null;
	}, g = () => {
		c();
	}, _ = function(...e) {
		if (n?.aborted) return;
		i = this, a = e;
		let t = u == null;
		d(), o && t && c();
	};
	return _.schedule = d, _.cancel = m, _.flush = g, n?.addEventListener("abort", m, { once: !0 }), _;
}
function throttle(e, t, { signal: n, edges: r = ["leading", "trailing"] } = {}) {
	let i = null, a = debounce(e, t, {
		signal: n,
		edges: r
	}), o = function(...e) {
		i == null ? i = Date.now() : Date.now() - i >= t && (i = Date.now(), a.cancel()), a.apply(this, e);
	};
	return o.cancel = a.cancel, o.flush = a.flush, o;
}
function useRefreshPlayStateTrigger() {
	return {
		trigger: () => emitter.emit(REFRESH_PLAY_STATE_EVENT),
		onTrigger: (e) => {
			emitter.on(REFRESH_PLAY_STATE_EVENT, e), onUnmounted(() => emitter.off(REFRESH_PLAY_STATE_EVENT, e));
		}
	};
}
var ConcurrencyPool = class {
	limit;
	running;
	queue;
	constructor(e) {
		this.limit = e, this.running = 0, this.queue = [];
	}
	async runTask(e) {
		this.running++;
		try {
			let t = await e.fn();
			e.resolve(t);
		} catch (t) {
			e.reject(t);
		} finally {
			this.running--, this.runNext();
		}
	}
	runNext() {
		if (this.running < this.limit && this.queue.length > 0) {
			let e = this.queue.shift();
			e && this.runTask(e);
		}
	}
	async add(e) {
		return new Promise((t, n) => {
			let r = {
				fn: e,
				resolve: t,
				reject: n
			};
			this.running < this.limit ? this.runTask(r) : this.queue.push(r);
		});
	}
	get active() {
		return this.running;
	}
	get pending() {
		return this.queue.length;
	}
}, BackBtn_default = /* @__PURE__ */ defineComponent({
	__name: "BackBtn",
	setup(e) {
		let t = usePlayingStore();
		async function n() {
			if (t.currentTime = 0, t.mode === "order") t.currentPlaylist?.getPrevSong();
			else {
				let e = t.currentPlaylist;
				e.index === e.lastIdx ? t.currentPlaylist?.getPrevSong() : e.index = e.lastIdx;
			}
		}
		return (e, t) => (openBlock(), createElementBlock("div", {
			class: "i-ri:skip-back-line w-18% text-xl",
			onClick: n
		}));
	}
}), ForwardBtn_default = /* @__PURE__ */ defineComponent({
	__name: "ForwardBtn",
	setup(e) {
		let t = usePlayingStore();
		async function n() {
			t.currentTime = 0, t.mode === "order" ? t.currentPlaylist?.getNextSong() : t.mode === "random" ? t.currentPlaylist?.getRandSong() : t.currentPlaylist?.getCurrentSong();
		}
		return watch(() => t.currentTime, () => {
			t.currentTime >= t.songDuration && (n(), t.currentTime = 0);
		}), (e, t) => (openBlock(), createElementBlock("div", {
			class: "i-ri:skip-forward-line w-18% text-xl",
			onClick: n
		}));
	}
}), OrderBtn_default = /* @__PURE__ */ defineComponent({
	__name: "OrderBtn",
	setup(e) {
		let t = usePlayingStore();
		function n() {
			t.mode === "order" ? t.mode = "random" : t.mode === "random" ? t.mode = "loop" : t.mode = "order";
		}
		return (e, r) => (openBlock(), createElementBlock("div", {
			class: normalizeClass(["w-18% text-xl", {
				"i-ri:order-play-line": unref(t).mode === "order",
				"i-ri:shuffle-line": unref(t).mode === "random",
				"i-ri:loop-right-line": unref(t).mode === "loop"
			}]),
			onClick: n
		}, null, 2));
	}
}), PlayBtn_default = /* @__PURE__ */ defineComponent({
	__name: "PlayBtn",
	setup(e) {
		let t = usePlayingStore(), { trigger: n } = useRefreshPlayStateTrigger();
		function r() {
			t.toggle(), n();
		}
		return (e, n) => (openBlock(), createElementBlock("div", {
			class: normalizeClass(["w-18% text-4xl", {
				"i-ri:play-circle-fill": !unref(t).playing,
				"i-ri:pause-circle-fill": unref(t).playing
			}]),
			onClick: r
		}, null, 2));
	}
}), VolumeBtn_default = /* @__PURE__ */ defineComponent({
	__name: "VolumeBtn",
	setup(e) {
		let t = usePlayingStore(), n = computed(() => t.enableVolume);
		function r() {
			t.enableVolume = !t.enableVolume;
		}
		return (e, t) => (openBlock(), createElementBlock("div", {
			class: normalizeClass(["w-18% text-xl", {
				"i-ri:volume-up-line": n.value,
				"i-ri:volume-mute-line": !n.value
			}]),
			onClick: r
		}, null, 2));
	}
}), _hoisted_1$7 = { class: "controller flex cursor-pointer items-center justify-around text-align-center text-sm" }, AudioController_default = /* @__PURE__ */ defineComponent({
	__name: "AudioController",
	setup(e) {
		return (e, t) => (openBlock(), createElementBlock("div", _hoisted_1$7, [
			createVNode(OrderBtn_default),
			createVNode(BackBtn_default),
			createVNode(PlayBtn_default),
			createVNode(ForwardBtn_default),
			createVNode(VolumeBtn_default)
		]));
	}
}), _hoisted_1$6 = { class: "tabs relative block" }, _hoisted_2$2 = { class: "nav h-[2.6875rem] border-[0.0625rem] border-b border-[var(--player-background)]" }, _hoisted_3 = { class: "flex overflow-x-auto whitespace-nowrap p-0" }, _hoisted_4 = ["data-index", "onClick"], _hoisted_5 = {
	key: 0,
	class: "relative m-[0.625rem_0_0] h-[12.5rem] list-none overflow-y-auto p-[0.3125rem_0] text-[0.8125em]"
}, _hoisted_6 = ["onClick"], _hoisted_7 = { class: "name float-left" }, _hoisted_8 = ["data-dtime", "data-ptime"], ListTab_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
	__name: "ListTab",
	setup(e) {
		let t = usePlayingStore(), n = t.playlists, r = ref(t.currentPlaylistIndex), i = computed(() => r), a = ref(0), o = ref([]);
		onMounted(() => {
			t.playlists.forEach((e) => {
				o.value.push(e.name);
			});
		});
		function s(e, n) {
			t.currentTime = 0, t.setCurrentPlaylist(e), t.currentPlaylist && (t.currentPlaylist.index = n);
		}
		function c(e) {
			let t = Math.floor(e / 60), n = Math.floor(e % 60);
			return `${t}:${n < 10 ? "0" : ""}${n}`;
		}
		let l = computed(() => c(t.songDuration)), u = computed(() => c(t.currentTime));
		return watch(() => t.currentTime, () => {
			a.value = t.currentTime / t.songDuration * 100;
		}), (e, c) => (openBlock(), createElementBlock("div", _hoisted_1$6, [createBaseVNode("div", _hoisted_2$2, [createBaseVNode("ul", _hoisted_3, [(openBlock(!0), createElementBlock(Fragment, null, renderList(o.value, (e, t) => (openBlock(), createElementBlock("li", {
			key: e,
			class: normalizeClass(["relative m-0 inline-block cursor-pointer border-none p-[0.3125rem_1.25rem]", { active: t === i.value.value }]),
			"data-index": t,
			onClick: (e) => r.value = t
		}, toDisplayString(e), 11, _hoisted_4))), 128))])]), createVNode(TransitionGroup, { name: "fade" }, {
			default: withCtx(() => [(openBlock(!0), createElementBlock(Fragment, null, renderList(unref(n), (e) => (openBlock(), createElementBlock("div", { key: e.name }, [e.sIndex === i.value.value ? (openBlock(), createElementBlock("ol", _hoisted_5, [(openBlock(!0), createElementBlock(Fragment, null, renderList(e.playlist, (n, r) => (openBlock(), createElementBlock("li", {
				key: n.name,
				class: normalizeClass(["relative h-[2rem] flex cursor-pointer overflow-hidden p-[0.3125rem_0.9375rem_0.3125rem_1.5625rem] hover:bg-[var(--player-background)]", {
					current: e.index === r && unref(t).currentPlaylistIndex === i.value.value,
					error: !1
				}]),
				onClick: (t) => s(e.sIndex, r)
			}, [createBaseVNode("span", { class: normalizeClass(["info block w-full", { "pr-[5rem] select-none": e.index === r && unref(t).currentPlaylistIndex === i.value.value }]) }, [createBaseVNode("span", _hoisted_7, toDisplayString(n.name), 1), createBaseVNode("span", { class: normalizeClass(["artist float-right ml-[0.625rem] text-[var(--secondary-text)]", { hidden: e.index === r && unref(t).currentPlaylistIndex === i.value.value }]) }, toDisplayString(n.artist), 3)], 2), e.index === r && unref(t).currentPlaylistIndex === i.value.value ? (openBlock(), createElementBlock("div", {
				key: 0,
				class: "progress",
				"data-dtime": l.value,
				"data-ptime": u.value
			}, [createBaseVNode("div", {
				class: "bar absolute left-0 top-0 h-full rounded-[0.8125em] bg-[var(--primary-color-a)] transition-width duration-250 ease-linear",
				style: normalizeStyle({ width: `${a.value}%` })
			}, null, 4)], 8, _hoisted_8)) : createCommentVNode("", !0)], 10, _hoisted_6))), 128))])) : createCommentVNode("", !0)]))), 128))]),
			_: 1
		})]));
	}
}), __plugin_vue_export_helper_default = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, ListTab_default = /* @__PURE__ */ __plugin_vue_export_helper_default(ListTab_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-f2ce0d19"]]), _hoisted_1$5 = { class: "playlist" }, PlayListTabs_default = /* @__PURE__ */ __plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "PlayListTabs",
	setup(e) {
		return (e, t) => (openBlock(), createElementBlock("div", _hoisted_1$5, [createVNode(ListTab_default)]));
	}
}), [["__scopeId", "data-v-e7dd3f4e"]]), _hoisted_1$4 = { class: "disc relative max-h-48 max-w-48 p-6" }, _hoisted_2$1 = ["src"], AudioCover_default = /* @__PURE__ */ __plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "AudioCover",
	setup(e) {
		let t = usePlayingStore(), n = ref(t.playing);
		watch(() => t.playing, async (e) => {
			n.value = e;
		});
		let r = computed(() => t.currentSong?.pic ?? "");
		return (e, t) => (openBlock(), createElementBlock("div", { class: normalizeClass(["cover relative flex flex-shrink-0 cursor-pointer items-center justify-center before:absolute before:z-1 before:content-empty", { playing: n.value }]) }, [createBaseVNode("div", _hoisted_1$4, [createVNode(Transition, {
			name: "blurx",
			mode: "out-in"
		}, {
			default: withCtx(() => [(openBlock(), createElementBlock("div", {
				key: r.value,
				class: "h-6rem w-6rem overflow-hidden rounded-50%"
			}, [createBaseVNode("img", {
				src: r.value,
				alt: "music cover",
				class: "max-h-full max-w-full"
			}, null, 8, _hoisted_2$1)]))]),
			_: 1
		})])], 2));
	}
}), [["__scopeId", "data-v-11b6333c"]]);
function parseLyricLine(e) {
	let t = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/.exec(e);
	if (!t || !t[1] || !t[2]) return null;
	let n = Number.parseInt(t[1]) * 60, r = Number.parseInt(t[2]), i = 0;
	if (t[3]) {
		let e = Number.parseInt(t[3]);
		i = t[3].length === 2 ? e / 100 : e / 1e3;
	}
	return n + r + i;
}
function parseLyric(e) {
	if (!e) return [];
	let t = e.split("\n").filter(Boolean).map((e) => {
		let t = parseLyricLine(e);
		if (t === null) return null;
		let n = e.indexOf("]");
		return {
			start: t,
			text: n === -1 ? e.trim() : e.substring(n + 1).trim()
		};
	}).filter((e) => e !== null), n = [];
	for (let e = 0; e < t.length; e++) {
		let r = t[e], i = t[e + 1], a = i ? i.start : Infinity;
		n.push({
			text: r.text,
			start: r.start,
			end: a
		});
	}
	return n;
}
var MaximumMap = class extends Map {
	maxSize;
	constructor(e) {
		super(), this.maxSize = e;
	}
	set(e, t) {
		if (this.size >= this.maxSize) {
			let e = this.keys().next().value;
			e !== void 0 && this.delete(e);
		}
		return super.set(e, t);
	}
}, _hoisted_1$3 = { class: "lrc relative mt-1.25 max-h-16 overflow-hidden text-center text-3" }, _hoisted_2 = { class: "inner w-full transition-all duration-500 transition-ease-out" }, MusicLRC_default = /* @__PURE__ */ __plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "MusicLRC",
	setup(e) {
		let t = ref(0), n = usePlayingStore(), r = new MaximumMap(100), { data: i } = useFetch(computed(() => n.currentSong?.lrc ?? ""), {
			refetch: !0,
			async beforeFetch({ url: e, cancel: t }) {
				r.has(e) && t();
			}
		}).get().text(), a = ref([]);
		watch(i, () => {
			if (r.has(n.currentSong?.lrc ?? "")) a.value = r.get(n.currentSong?.lrc ?? "") ?? [];
			else {
				let e = parseLyric(i.value ?? "");
				r.set(n.currentSong?.lrc ?? "", e), a.value = e;
			}
		});
		let o = ref([]), s = 0;
		return watch(() => n.currentTime, (e) => {
			let t = a.value.findIndex((t) => e >= t.start && e <= t.end);
			t !== -1 && t !== s && (s = t, o.value = a.value.slice(s, Math.min(s + 4, a.value.length)));
		}), watch(() => n.currentSong?.lrc, () => {
			o.value = [], t.value = 0;
		}), (e, n) => (openBlock(), createElementBlock("div", _hoisted_1$3, [createBaseVNode("div", _hoisted_2, [createVNode(TransitionGroup, {
			name: "list",
			tag: "ul",
			class: "p-0"
		}, {
			default: withCtx(() => [(openBlock(!0), createElementBlock(Fragment, null, renderList(o.value, (e, n) => (openBlock(), createElementBlock("li", {
				key: e.start,
				class: "list-none"
			}, [createBaseVNode("p", { class: normalizeClass({ current: n === t.value }) }, toDisplayString(e.text), 3)]))), 128))]),
			_: 1
		})])]));
	}
}), [["__scopeId", "data-v-cf5f5ece"]]), _hoisted_1$2 = { class: "w-full flex flex-col overflow-hidden text-ellipsis" }, AudioInfo_default = /* @__PURE__ */ __plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "AudioInfo",
	setup(e) {
		let t = usePlayingStore(), n = computed(() => t.currentSong?.name ?? ""), r = computed(() => t.currentSong?.artist ?? "");
		return (e, t) => (openBlock(), createElementBlock("div", _hoisted_1$2, [
			createVNode(Transition, {
				name: "fade",
				mode: "out-in"
			}, {
				default: withCtx(() => [(openBlock(), createElementBlock("h4", {
					key: n.value,
					class: "m-0 max-h-12 flex justify-center overflow-hidden text-ellipsis p-0"
				}, toDisplayString(n.value), 1))]),
				_: 1
			}),
			createVNode(Transition, {
				name: "fade",
				mode: "out-in"
			}, {
				default: withCtx(() => [(openBlock(), createElementBlock("span", {
					key: r.value,
					class: "flex justify-center text-3"
				}, toDisplayString(r.value), 1))]),
				_: 1
			}),
			(openBlock(), createBlock(Suspense, null, {
				default: withCtx(() => [createVNode(MusicLRC_default)]),
				fallback: withCtx(() => [...t[0] ||= [createBaseVNode("div", { class: "flex justify-center text-3" }, " Loading... ", -1)]]),
				_: 1
			}))
		]));
	}
}), [["__scopeId", "data-v-93a811a6"]]), _hoisted_1$1 = { class: "preview flex-col items-center pb-0 pl-2.5 pr-2.5 pt-5 md:flex md:flex-row md:pl-5 md:pr-5" }, AudioPreview_default = /* @__PURE__ */ defineComponent({
	__name: "AudioPreview",
	setup(e) {
		return (e, t) => (openBlock(), createElementBlock("div", _hoisted_1$1, [createVNode(AudioCover_default), createVNode(AudioInfo_default)]));
	}
}), _hoisted_1 = ["src", "muted"], AudioPlayer_default = /* @__PURE__ */ __plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "AudioPlayer",
	props: {
		showPlayer: { type: Boolean },
		playlistURLs: {}
	},
	async setup(e) {
		let t, n, r = new ConcurrencyPool(3), i = e, a = usePlayingStore(), o = useTemplateRef("audio"), { trigger: s, onTrigger: c } = useRefreshPlayStateTrigger();
		if (onMounted(() => {
			c(async () => {
				o.value !== null && (a.playing ? (a.mode === "loop" && (o.value.loop = !0), await o.value.play()) : o.value.pause());
			});
		}), a.playlists.length === 0) {
			let e = async (e, t) => {
				let n = new PlayList(e.url, e.name, t);
				try {
					n.parserURL(), await n.fetchPlaylist(), a.playlists[t] = n;
				} catch (r) {
					console.error(`Failed to initialize playlist ${e.name}:`, r), a.playlists[t] = n;
				}
			};
			a.playlists = Array(i.playlistURLs.length), [t, n] = withAsyncContext(() => Promise.allSettled(i.playlistURLs.map((t, n) => r.add(() => e(t, n))))), await t, n();
		}
		let l = throttle((e) => {
			let t = e.target.currentTime;
			a.lastPage === window.location.pathname ? a.setCurrentTime(t) : (e.target.currentTime = a.currentTime, a.lastPage = window.location.pathname), a.songDuration = e.target.duration || a.songDuration;
		}, 250), u = computed(() => a.currentSong?.url ?? ""), d = useTemplateRef("target");
		return onClickOutside(d, () => a.showPlayer = !1, { ignore: [inject("showBtnEl"), inject("playBtnEl")] }), (e, t) => (openBlock(), createBlock(Transition, { name: "slideRight" }, {
			default: withCtx(() => [withDirectives(createBaseVNode("div", {
				ref_key: "target",
				ref: d,
				class: "player-info border-radius-0.8rem fixed z-9 overflow-hidden rounded-xl"
			}, [
				createVNode(AudioPreview_default),
				createVNode(AudioController_default),
				createBaseVNode("audio", {
					ref: "audio",
					src: u.value,
					muted: !unref(a).enableVolume,
					onTimeupdate: t[0] ||= (...e) => unref(l) && unref(l)(...e),
					onCanplay: t[1] ||= (e) => unref(s)()
				}, null, 40, _hoisted_1),
				createVNode(PlayListTabs_default),
				createBaseVNode("div", {
					class: "absolute right-4 top-3 cursor-pointer text-3.25 hover:color-[var(--hover-btn)]",
					onClick: t[2] ||= (e) => unref(a).showPlayer = !1
				}, [...t[3] ||= [createBaseVNode("div", { class: "i-ri-close-line text-5" }, null, -1)]])
			], 512), [[vShow, unref(a).showPlayer]])]),
			_: 1
		}));
	}
}), [["__scopeId", "data-v-c4bb13dd"]]);
const nyxPreset = { styles: {
	light: {
		playerBorder: "#fdfdfd",
		playerBackground: "alpha(#fdfdfd, 0.7)",
		closeBtn: "#ccc",
		primaryText: "#666",
		secondaryText: "#999",
		playListLine: "alpha(#000, 0.1)",
		hoverBtn: "rgb(10,116,38)",
		boxBackgroundShadow: "var(--playlist-line)",
		primaryColor: "10,116,38"
	},
	dark: {
		playerBorder: "#363636",
		playerBackground: "alpha(#22222, 0.7)",
		closeBtn: "#aaa",
		primaryText: "#aaa",
		secondaryText: "#aaa",
		playListLine: "alpha(#fff, 0.1)",
		hoverBtn: "rgb(10,116,38)",
		boxBackgroundShadow: "var(--playlist-line)",
		primaryColor: "10,116,38"
	}
} }, presets = {
	nyx: nyxPreset,
	shokax: { styles: {
		light: {
			playerBorder: "#fdfdfd",
			playerBackground: "alpha(#fdfdfd, 0.7)",
			closeBtn: "#ccc",
			primaryText: "#666",
			secondaryText: "#999",
			playListLine: "alpha(#000, 0.1)",
			hoverBtn: "#ed6ea0",
			boxBackgroundShadow: "var(--playlist-line)",
			primaryColor: "233,84,107"
		},
		dark: {
			playerBorder: "#363636",
			playerBackground: "alpha(#22222, 0.7)",
			closeBtn: "#aaa",
			primaryText: "#aaa",
			secondaryText: "#aaa",
			playListLine: "alpha(#fff, 0.1)",
			hoverBtn: "#ed6ea0",
			boxBackgroundShadow: "var(--playlist-line)",
			primaryColor: "233,84,107"
		}
	} }
};
var NyxPlayer_default = /* @__PURE__ */ defineComponent({
	__name: "NyxPlayer",
	props: {
		urls: {},
		showBtn: {},
		playBtn: {},
		darkModeTarget: {},
		preset: {},
		styles: {}
	},
	setup(e) {
		let t = e, n = usePlayingStore(), { trigger: r } = useRefreshPlayStateTrigger(), i = ref(null), a = ref(null);
		provide("showBtnEl", i), provide("playBtnEl", a);
		function o(e) {
			i.value = e, e.addEventListener("click", () => {
				n.showPlayer = !n.showPlayer;
			}), watch(() => n.showPlayer, () => {
				e.dataset.show = n.showPlayer ? "true" : "false";
			}, { immediate: !0 });
		}
		function s(e) {
			a.value = e, e.addEventListener("click", () => {
				n.playing = !n.playing, r(), e.dataset.play = n.playing ? "true" : "false";
			}), watch(() => n.playing, () => {
				e.dataset.play = n.playing ? "true" : "false";
			}, { immediate: !0 });
		}
		onMounted(() => {
			if (typeof t.showBtn == "string") {
				let e = document.querySelector(t.showBtn);
				if (e) o(e);
				else throw Error("showBtn not found");
			} else t.showBtn && "value" in t.showBtn && t.showBtn.value instanceof HTMLElement ? watch(t.showBtn, (e) => {
				e && o(e);
			}, { immediate: !0 }) : t.showBtn instanceof HTMLElement ? o(t.showBtn) : watch(() => t.showBtn, (e) => {
				e instanceof HTMLElement && o(e);
			}, { once: !0 });
		}), onMounted(() => {
			if (typeof t.playBtn == "string") {
				let e = document.querySelector(t.playBtn);
				if (e) s(e);
				else throw Error("playBtn not found");
			} else t.playBtn && "value" in t.playBtn && t.playBtn.value instanceof HTMLElement ? watch(t.playBtn, (e) => {
				e && s(e);
			}, { immediate: !0 }) : t.playBtn instanceof HTMLElement ? s(t.playBtn) : watch(() => t.playBtn, (e) => {
				e instanceof HTMLElement && s(e);
			}, { once: !0 });
		});
		let c = t.styles || presets.nyx;
		if (t.preset) {
			let e = presets[t.preset];
			if (e) Object.assign(c, e);
			else throw Error(`preset ${t.preset} not found in official presets`);
		}
		let l = ref("light");
		if (t.darkModeTarget === "auto") {
			let e = globalThis.matchMedia("(prefers-color-scheme: dark)");
			l.value = e.matches ? "dark" : "light", e.addEventListener("change", (e) => {
				l.value = e.matches ? "dark" : "light";
			});
		} else l.value = "light";
		return useCssVars(() => {
			let e = c.styles[l.value], t = nyxPreset.styles[l.value];
			return Object.assign(e, t), {
				"player-border": e.playerBorder,
				"close-btn": e.closeBtn,
				"secondary-text": e.secondaryText,
				"primary-text": e.primaryText,
				"player-background": e.playerBackground,
				"playlist-line": e.playListLine,
				"hover-btn": e.hoverBtn,
				"box-bg-shadow": e.boxBackgroundShadow,
				"primary-color": `rgb(${e.primaryColor})`,
				"primary-color-a": `rgba(${e.primaryColor}, 0.3)`
			};
		}), (t, r) => (openBlock(), createBlock(Teleport, { to: "body" }, [(openBlock(), createBlock(Suspense, null, {
			default: withCtx(() => [createVNode(AudioPlayer_default, {
				id: "MusicPlayerRoot",
				"playlist-u-r-ls": e.urls,
				"show-player": unref(n).showPlayer
			}, null, 8, ["playlist-u-r-ls", "show-player"])]),
			_: 1
		}))]));
	}
});
function initPlayer(e, t, n, r, i, a, o) {
	if (!e || !t) throw Error("el and showBtn are required");
	let s = document.querySelector(e);
	if (!s) throw Error("el must be valid selectors");
	let c = createApp(() => h(NyxPlayer_default, {
		urls: n,
		showBtn: t,
		playBtn: r,
		darkModeTarget: i,
		preset: a,
		styles: o
	}));
	c.use(createPinia().use(src_default)), c.mount(s);
}
export { initPlayer };
