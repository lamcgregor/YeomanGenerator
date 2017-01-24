import $ from 'jquery';
import Slick from 'slick-carousel';

export default class Carousel {
    constructor(elem) {
        $(elem).slick();
    }
}