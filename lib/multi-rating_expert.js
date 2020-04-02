/**
 * multi-rating_main.js
 * Kyoung whan Choe (https://github.com/kywch/)
 *
 * showing multiple images for fast rating
 *
 **/

/*
 * Generic task variables
 */
var sbjId = ""; // mturk id
var task_id = ""; // the prefix for the save file -- the main seq
var data_dir = "";
var flag_debug = true;
if (flag_debug) {
    var trial_dur = 1000;
} else {
    var trial_dur = 8000;
}

var required_clicks = 4;
var count_strike = 0;
var rt_history = [];

// activity tracking
var focus = 'focus'; // tracks if the current tab/window is the active tab/window, initially the current tab should be focused
var fullscr_ON = 'no'; // tracks fullscreen activity, initially not activated
var fullscr_history = [];

// these urls must be checked
var save_url = 'https://users.rcc.uchicago.edu/~kywch/StreetPsych/save_data.php';

/*
 * Helper functions
 */
function generate_stimuli_mat(img_src, img_array, img_ext) {
    var nrows = img_array.length;
    var ncols = img_array[0].length;
    tmp_mat = [];
    for (var row = 0; row < nrows; row++) {
        tmp_row = [];
        for (var col = 0; col < ncols; col++) {
            tmp_row.push(img_src + img_array[row][col] + '.' + img_ext);
        }
        tmp_mat.push(tmp_row);
    }
    return tmp_mat;
}

const range = (start, numEle) => [...Array(numEle)].map((_, ii) => start + ii)

function shuffle(array) {
    let counter = array.length;
    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);
        // Decrease counter by 1
        counter--;
        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

Array.prototype.reshape = function (rows, cols) {
    var copy = this.slice(0); // Copy all elements.
    this.length = 0; // Clear out existing array.

    for (var r = 0; r < rows; r++) {
        var row = [];
        for (var c = 0; c < cols; c++) {
            var i = r * cols + c;
            if (i < copy.length) {
                row.push(copy[i]);
            }
        }
        this.push(row);
    }
};

function generate_multi_seq() {
    /*
        Preparing 94 multi-image rating trials for the 1119 images
        No attention checks.
    */
    var multi_seed = shuffle(range(1, 1119));
    var multi_seed2 = shuffle(multi_seed.slice(0, 1000));
    var multi_trial = multi_seed.concat(multi_seed2.slice(0, 9));
    // turning a long sequence into 94 trials of 12 images
    multi_trial.reshape(94, 12);

    var multi_seq = [];
    for (var ii = 0; ii < multi_trial.length; ii++) {
        // this trial does not include the attention-check trial
        multi_trial[ii].reshape(3, 4);
        multi_seq.push({
            'image_array': multi_trial[ii].map(row => row.map(el => el.toString().padStart(5, '0')))
        });
    }
    return shuffle(multi_seq);
}

function save_data() { // CHECK THE URL before use
    if (flag_debug) {
        console.log("Save data function called.");
        console.log(jsPsych.data.get().json());
    }
    jQuery.ajax({
        type: 'post',
        cache: false,
        url: save_url, // this is the path to the above PHP script
        data: {
            data_dir: data_dir,
            task_id: task_id,
            sbj_id: sbjId,
            sess_data: jsPsych.data.get().json()
        }
    });
}


/*
 * fast image rating instruction page
 */
function get_instruction_imglist(instr_url, num_slides = 9) {
    var imglist = [];
    for (var ii = 0; ii < num_slides; ii++) {
        imglist.push(instr_url + 'Slide' + (ii + 1).toString() + '.JPG');
    }
    return imglist;
}

function generate_instruction_page(imglist) {
    var fire_instructions_page = {
        type: 'instructions',
        pages: function () {
            var pages = [];
            for (var ii = 0; ii < imglist.length; ii++) {
                pages.push('<img class="resize" src="' + imglist[ii] + '">');
            }
            pages.push('<div class = centerbox><p class = block-text>You can read the instruction again by clicking the <strong>Previous</strong> button.</p>' +
                '<p class = block-text>Clicking the <strong>Next</strong> button will finish the instruction.</p></div>');
            return pages;
        },
        data: {
            exp_stage: 'fire_instructions_page',
            task_id: task_id,
            sbj_id: sbjId
        },
        allow_keys: false,
        show_clickable_nav: true,
        show_page_number: true
    };

    return fire_instructions_page;
}


/*
 * Practice block
 */
function generate_practice_block(prac_img_src, prac_seq, img_ext, task_prompt) {

    var block_sequence = [];
    var num_trial = prac_seq.length;

    var practice_instructions_page = {
        type: 'instructions',
        pages: [
            '<div class = centerbox><p class = block-text>Click next to continue the practice.</p>'
        ],
        allow_keys: false,
        show_clickable_nav: true,
        allow_backward: false,
        show_page_number: false,
        data: {
            exp_stage: 'practice_instructions',
            task_id: task_id,
            sbj_id: sbjId
        }
    };
    block_sequence.push(practice_instructions_page);

    for (var ii = 0; ii < num_trial; ii++) {
        var fire_trial = {
            type: 'multi-rating-trial',
            prompt_header: '<p class=very-large align=center>' + task_prompt + '</p>',
            prompt_footer: '<p class=large><<< Drag the blurry image to the <b>trash can</b>.<br>' +
                'Trial number: ' + (ii + 1).toString() + ' / ' + num_trial.toString() + '</p>',
            image_array: prac_seq[ii].image_array,
            attention_check: prac_seq[ii].attention_check,
            practice_flag: true,
            required_clicks: required_clicks,
            trial_duration: trial_dur,
            stimuli: generate_stimuli_mat(prac_img_src, prac_seq[ii].image_array, img_ext),
            data: {
                exp_stage: 'practice_trial_' + (ii + 1).toString()
            }
        }
        block_sequence.push(fire_trial);
    }

    return block_sequence;

}


/*
 * Main block
 * Implelment the 3-strikes-out policy
 */
function generate_main_block(main_img_src, main_seq, img_ext, task_prompt) {

    var block_sequence = [];
    var num_trial = main_seq.length;

    var main_instructions_page = {
        type: 'instructions',
        pages: [
            '<div class = centerbox><p class = block-text>The practice is finished. You can take a short break.</p>',
            '<div class = centerbox><p class = block-text>WARNING!! If you miss the blurry image twice, the study will be finished without the secret key.</p>',
            '<div class = centerbox><p class = block-text>Click next to begin the main trials.</p>'
        ],
        allow_keys: false,
        show_clickable_nav: true,
        allow_backward: true,
        show_page_number: false,
        data: {
            exp_stage: 'main_instructions',
            task_id: task_id,
            sbj_id: sbjId
        },
        on_finish: function (data) {
            save_data();
        }
    };
    //block_sequence.push(main_instructions_page);

    for (var ii = 0; ii < num_trial; ii++) {
        var fire_trial = {
            type: 'multi-rating-trial',
            prompt_header: '<p class=very-large align=center>' + task_prompt + '</p>',
            prompt_footer: '<p class=large><<< Drag the blurry image to the <b>trash can</b>.<br>' +
                'Trial number: ' + (ii + 1).toString() + ' / ' + num_trial.toString() + '</p>',
            image_array: main_seq[ii].image_array,
            attention_check: main_seq[ii].attention_check,
            required_clicks: required_clicks,
            trial_duration: trial_dur,
            stimuli: generate_stimuli_mat(main_img_src, main_seq[ii].image_array, img_ext),
            data: {
                exp_stage: 'main_trial_' + (ii + 1).toString()
            },
            on_finish: function (data) {
                rt_history.push(data.rt);
                if (data.flag_attention == false) {
                    count_strike++;
                    if (count_strike == 1) {
                        save_data();
                        alert('WARNING!! You did not drag the blurry picture to the trash can! One more miss will terminate your session.');
                    } else if (count_strike >= 2) {
                        save_data();
                        alert('SORRY. You failed the attention check. Your session is terminated.');
                        jsPsych.endExperiment('Attention check failed.');
                    }
                }
                if (flag_debug) {
                    console.log(data);
                    console.log("Strike count:", count_strike);
                }
            }
        }
        block_sequence.push(fire_trial);

        if (ii % 9 == 8) {
            var break_page = {
                type: 'instructions',
                pages: [
                    '<div class = centerbox><p class = block-text>You can take a short break. Click next to continue</p>'
                ],
                allow_keys: false,
                show_clickable_nav: true,
                allow_backward: false,
                show_page_number: false,
                data: {
                    exp_stage: 'main_break'
                },
                on_finish: function (data) {
                    save_data();
                }
            };
            block_sequence.push(break_page);
        }

    }

    return block_sequence;

}
