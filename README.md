# mathcrowd-geometry-lib

This is a Typescript library for 2D geometry. It contains classes for elements like points,
lines, circles, and polygons, intersection detection. Shapes may be organized into Planar Set - searchable container which support spatial queries. It focuses on geometric operations and relations, not on rendering or styling. It can be used in both Node.js and browser environments.

This library is based on and reorganizes code from flatten-js, adapting it to fit current needs.

This project is utilized in our mathematical visualization project for educatinal use and provides limited technical support on github.

## Features

- Support finding the distance and segment between any shape.
- Support affine transform on any shape.
- Support finding all intersection between any shape.

## Install

```
npm i @mathcrowd/mathcrowd-geometry-lib
```

## Usage

```javascript
import {
  Circle
} from '@mathcrowd/mathcrowd-geometry-lib'

const pt = new Point(0, 1)
const circle = new Circle(new Point(0, 0), 2)

if(circle.contains(pt)){
  console.log("Circle contains the point.)
}
```

## Documentation

see https://mathedu4all.github.io/mathcrowd-geometry-lib/

## About Us

Mathcrowd is a pioneering startup founded by seasoned independent developers and mathematics educators. We specialize in leveraging cutting-edge technology to revolutionize math education in China. Our mission is to create an engaging online community for math enthusiasts and self-learners, offering rich, interactive, and visualized learning content. We provide a collaborative space where mathematical ideas can be shared and explored, fostering a vibrant environment for continuous learning and discovery.

Official Site: https://www.mathcrowd.cn (Under construction)

## Copyright and License

Copyright © Mathcrowd ([charles@mathcrowd.cn](mailto:charles@mathcrowd.cn))  
Released under the [MIT license](LICENSE)