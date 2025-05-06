# WumpusGame

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.9.

![Hunt the Wumpus](https://upload.wikimedia.org/wikipedia/en/7/77/Ti_hunt_the_wumpus_boxart.jpg){style="display: block; margin: 0 auto" }

Hunt the Wumpus is a text-based adventure game developed by Gregory Yob in 1973. In the game, the player moves through a series of connected caves, arranged as the vertices of a dodecahedron, as they hunt a monster named the Wumpus. The turn-based game has the player trying to avoid fatal bottomless pits and "super bats" that will move them around the cave system; the goal is to fire one of their "crooked arrows" through the caves to kill the Wumpus. Yob created the game in early 1973 due to his annoyance at the multiple hide-and-seek games set in caves in a grid pattern, and multiple variations of the game were sold via mail order by Yob and the People's Computer Company. The source code to the game was published in Creative Computing in 1975 and republished in The Best of Creative Computing the following year.


[Wiki hunt Wumpus](https://en.wikipedia.org/wiki/Hunt_the_Wumpus)

## Development server

To start a local development server, run:

`
npm start
`

### Development watch server

`
npm run watch
`

## Production server

`
npm run build
`

## Testing 

`
npm run test
`

## Testing coverage

`
npm run test:coverage
`

[coverage report (you must run the previous command)](/coverage/wumpus-game/index.html)

## Lintering code

`
npm run lint
`

---

## Deploy on GitHub Pages

This project can be viewed live at: [https://deepname.github.io/wumpus-game/](https://deepname.github.io/wumpus-game/)

### How to deploy a new version

1. Run the following command to generate the build in the `docs/` folder with the correct base path:
   
   ```bash
   npx ng build --output-path docs --base-href /wumpus-game/
   ```

3. Commit and push the `docs/` folder to the repository:

   ```bash
   git add docs
   git commit -m "build: producción para GitHub Pages"
   git push
   ```

4. Make sure GitHub Pages is configured to serve from the `/docs` folder on the `main` branch.

In a few minutes, the changes will be reflected in the public [URL](https://deepname.github.io/wumpus-game/).
