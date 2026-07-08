---
title: MidiControllerEvent
description: MidiControllerEvent Reference
---

# MidiControllerEvent

## MidiControllerEvent {#module:@toptensoftware/cantabile-js.MidiControllerEvent}


An anonymous type representing a complex MIDI controller event.  

MidiController events can be passed to anywhere that expects MIDI Data (eg: a target MIDI binding point), or can be 
used as a condition on a MIDI source binding point.


```ts
interface MidiControllerEvent
{
    channel: number;
    kind: MidiControllerEventKind;
    controller: number;
    value: number;
}
```

### channel {#module:@toptensoftware/cantabile-js.MidiControllerEvent#channel}

The zero based MIDI channel number of the event (0-15) 

```ts
channel: number;
```

### controller {#module:@toptensoftware/cantabile-js.MidiControllerEvent#controller}


The associated controller number for any of the controller event kinds, or the program
number for program change event kinds.  

When used as a source binding condition, this property can be set to -1 for program change
events to be triggered on any program change.


```ts
controller: number;
```

### kind {#module:@toptensoftware/cantabile-js.MidiControllerEvent#kind}

The kind of MIDI event 

```ts
kind: MidiControllerEventKind;
```

### value {#module:@toptensoftware/cantabile-js.MidiControllerEvent#value}


The value property is only used when sending MIDI data and is ignored if specified when
setting a source binding condition.


```ts
value: number;
```

