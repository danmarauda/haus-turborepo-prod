---
name: react-debugging
description: Debug React useEffect infinite loops, excessive re-renders, and "Maximum update depth exceeded" errors. Use when encountering render loops or performance issues.
---

# React useEffect Debugging

## Quick Diagnostic

| Symptom | Likely Cause | Quick Fix |
|---------|--------------|-----------|
| Effect runs every render | Missing/wrong dependencies | Check dependency array |
| Runs on object/array change | Reference inequality | Use useCallback/useMemo |
| Runs after state update inside effect | State update triggers re-run | Remove from deps OR functional update |
| Runs in development only (2x) | React Strict Mode | Expected behavior |

## Systematic Debugging Steps

### 1. Add Diagnostic Logging
```javascript
useEffect(() => {
  console.log('Effect triggered', {
    timestamp: Date.now(),
    dep1: someProp,
    dep2: someState,
  });
  return () => console.log('Cleanup triggered');
}, [someProp, someState]);
```

### 2. Check Reference Equality

```javascript
// ❌ WRONG - Creates new object every render
useEffect(() => {
  fetchData({ userId: user.id });
}, [{ userId: user.id }]); // New reference each time!

// ✅ CORRECT - Use primitive
useEffect(() => {
  fetchData({ userId: user.id });
}, [user.id]); // Primitive value
```

### 3. Stabilize Function References

```javascript
// ❌ WRONG
const handleData = (data) => console.log(data);
useEffect(() => {
  fetchData().then(handleData);
}, [handleData]); // New function every render!

// ✅ CORRECT
const handleData = useCallback((data) => {
  console.log(data);
}, []);
useEffect(() => {
  fetchData().then(handleData);
}, [handleData]);
```

### 4. State Updates Inside Effect

```javascript
// ❌ WRONG - data in deps causes loop
useEffect(() => {
  const newData = transformData(someProp);
  setData(newData);
}, [someProp, data]);

// ✅ CORRECT - Remove data from dependencies
useEffect(() => {
  const newData = transformData(someProp);
  setData(newData);
}, [someProp]);

// ✅ ALTERNATIVE - Functional update
useEffect(() => {
  setData(prevData => transformData(someProp, prevData));
}, [someProp]);
```

### 5. Cleanup for Async Operations

```javascript
useEffect(() => {
  const abortController = new AbortController();

  async function fetchData() {
    try {
      const response = await fetch('/api/data', {
        signal: abortController.signal
      });
      setData(await response.json());
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Fetch error:', error);
      }
    }
  }

  fetchData();
  return () => abortController.abort();
}, []);
```

## Diagnostic Flowchart

```
Infinite loop in useEffect?
  ├─→ Add console.log with timestamps
  ├─→ Run ESLint exhaustive-deps
  ├─→ Objects/arrays in deps?
  │     └─→ YES: Use useMemo to stabilize
  ├─→ Functions in deps?
  │     └─→ YES: Use useCallback to stabilize
  ├─→ State update inside effect?
  │     └─→ YES: Remove from deps OR functional update
  ├─→ Parent component re-rendering?
  │     └─→ YES: Memoize parent's props
  └─→ Async without cleanup?
        └─→ YES: Add AbortController
```

## Common Expo/React Native Issues

### Navigation State Changes
```javascript
// ❌ Effect runs on every navigation
useEffect(() => {
  loadData(route.params);
}, [route.params]); // Object reference changes!

// ✅ Extract specific params
const { id } = route.params;
useEffect(() => {
  loadData(id);
}, [id]);
```

### Gesture Handler Callbacks
```javascript
// ❌ Gesture handler recreated
const onSwipe = (event) => handleSwipe(event, someState);

// ✅ Use useCallback with dependencies
const onSwipe = useCallback((event) => {
  handleSwipe(event, someState);
}, [someState]);
```
