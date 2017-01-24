import $ from 'jquery';
import {default as Carousel} from './modules/carousel';

$(document).ready(() =>{
    let $carousels = $('.carousel');
    if($carousels.length > 0) {
        for(let $carousel of $carousels) {
            new Carousel($carousel)
        }
    }
})