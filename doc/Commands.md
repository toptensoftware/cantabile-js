---
title: Commands
description: Commands Reference
---

# Commands

## Commands Class {#module:@toptensoftware/cantabile-js.Commands}


Provides access to Cantabile's UI commands

Access this object via the {{#crossLink "Cantabile/commands:property"}}{{/crossLink}} property.



```ts
class Commands extends EndPoint {
    availableCommands(): Promise<CommandInfo[]>;
    invoke(id: string): Promise<any>;
}
```

### availableCommands() {#module:@toptensoftware/cantabile-js.Commands#availableCommands}


Retrieves a list of available commands

If Cantabile is running on your local machine you can view this list
directly at <http://localhost:35007/api/commands/availableCommands>



```ts
availableCommands(): Promise<CommandInfo[]>;
```

### invoke() {#module:@toptensoftware/cantabile-js.Commands#invoke}


Invokes a command



```ts
invoke(id: string): Promise<any>;
```

* **`id`** The id of the command to invoke

