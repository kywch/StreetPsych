<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

date_default_timezone_set('America/Chicago');

//header('Access-Control-Allow-Origin: https://ssd.az1.qualtrics.com');
header('Access-Control-Allow-Origin: *');

/* variables */
$counter_file = 'counter.txt';

// all sequences are in the main_seq directory
$seqs_dir = 'main_seqs';
// if one needs to sample a subset of those,
// copy those seqs to a separate directory and specify here
/* read the main_seqs file content */
$seqs_list = glob($seqs_dir . '/*.txt');
if (count($seqs_list) < 1)
{
    echo "ERROR. No sequence files.";
    exit;
}

/* counter reset operation, if comes with ?oper=reset */
if (isset($_GET['oper']))
{
    if ($_GET['oper'] == 'reset')
    {
        file_put_contents($counter_file, '0');
        echo "The counter has been reset.<br>";
        echo "There are " . count($seqs_list) . " sequences: <br><br>";
        // print out the current sequences
        foreach ($seqs_list as $seq_file)
        {
            echo " - $seq_file<br>";
        }
        exit;
    }
}

/* counter-related operation */
// identify the sequence to return
if (file_exists($counter_file))
{
    $fp = fopen($counter_file, "r+");
    if (flock($fp, LOCK_EX))
    {
        // read out the number
        $dist_seq = intval(fread($fp, filesize($counter_file)));
        $next_count = strval($dist_seq + 1);

        // update the counter
        ftruncate($fp, 0); // truncate file
        rewind($fp);
        fwrite($fp, $next_count); // set your data
        fflush($fp); // flush output before releasing the lock
        flock($fp, LOCK_UN); // release the lock
        fclose($fp);

        // limit the dist_seq to be within 0 to count($seqs_list)
        $dist_seq = $dist_seq % count($seqs_list);

    }
    else
    {
        // forget the counter and give out an random index
        fclose($fp);
        mt_srand(crc32(microtime()));
        $dist_seq = mt_rand(0, count($seqs_list) - 1);
    }

}
else
{
    // return the first sequence
    $dist_seq = 0;
    // create the counter file
    file_put_contents($counter_file, '1');
}

// return the sequence as javascript file!!



header('Content-Type: application/javascript');
echo file_get_contents($seqs_list[$dist_seq]);
exit;

?>
