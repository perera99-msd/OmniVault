# Contributing to OmniVault 🤝

First off, thank you for considering contributing to **OmniVault**! It's people like you that make OmniVault such a great financial SaaS tool.

## Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check our [Issues](../../issues) to see if someone else has already created a ticket. If not, go ahead and make one!

## Fork & create a branch

If this is something you think you can fix, then fork OmniVault and create a branch with a descriptive name.

A good branch name would be (where issue #325 is the ticket you're working on):

```sh
git checkout -b 325-add-euro-currency-support
```

## Implement your fix or feature

At this point, you're ready to make your changes! Feel free to ask for help; everyone is a beginner at first 😸.

## Code formatting

We use standard `eslint` and `prettier` configurations for Next.js and TypeScript. Please ensure your code is cleanly formatted before creating a Pull Request.

## Make a Pull Request

At this point, you should switch back to your master branch and make sure it's up to date with OmniVault's master branch:

```sh
git remote add upstream git@github.com:your-repo/omnivault.git
git checkout master
git pull upstream master
```

Then update your feature branch from your local copy of master, and push it!

```sh
git checkout 325-add-euro-currency-support
git rebase master
git push --set-upstream origin 325-add-euro-currency-support
```

Finally, go to GitHub and make a Pull Request! 🎉

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
