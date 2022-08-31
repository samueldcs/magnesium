# Magnesium

Hacky, work-in-progress and use-case-specific Redis-powered synchronization for my Obsidian vault. That could be a headline.

## How does this work?

Magnesium introduces *Context*, which is a essentially a JSON mirror of your vault stored as a local text file.
Everytime Obsidian triggers an event, Magnesium pushes this change onto a remote Redis store, thus creating an online context.

When you open your vault, Magnesium will attempt to sync your local context with its remote counterpart. In order for that to happen:

- Remote files not present in your local context will be created
- Local files with versions older than their remote counterparts will be updated
- Files in your local context that weren't pushed to the remote context will be deleted

As you can see, this is a very opinionated (and non-configurable) flow which was designed specifically for my use of Obsidian.

## How do I use this?

You probably shouldn't, considering Obsidian has [their own feature-rich and stable sync solution](https://obsidian.md/sync) which won't require you to host a Redis instance. If you really feel like it, however, you can change the connection string in `redis.ts` to connect to your Redis instance, then rebuild the plugin and use it in your vault.

## Code quality

I tried an iterative REPL-driven approach to design this piece of software, therefore it doesn't have tests for now - I might (probably) add them in the future. I tried keeping the code clean, but there's a lot of room for improvement.
