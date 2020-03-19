clear;

load('matTrial_1119img_150set.mat');
[numTrial, numPos] = size(matTrial{1}{1});
numSet = length(matTrial);
numSbj = length(matTrial{1});

% various checks
%assert(length(image_names) == length(unique(matTrial{1}{1})), 'The number of images does not match.');
assert(numTrial == 60, 'The number of trials is wrong.');
assert(numPos == 12, 'The number of images per trial is wrong.');
attnChk = 90000; % image id larger than 1030 are the attention checks

%numImg = numTrial * numPos;
numImg = 1119;

for ii = 1:numImg
    image_names{ii} = num2str(ii, '%05d');
end

for ii = 1:12
    image_names{attnChk+ii} = ['t9', num2str(ii, '%03d')];
end




%% convert matTrial into sequence javascript files

for iSet = 1:numSet
    for iSbj = 1:numSbj
        
        fid = fopen(fullfile('seqs_1119img', ['main_seq_', num2str(iSet*100 + iSbj, '%05d'), '.txt']), 'w');
        
        fprintf(fid, ['var main_seq_id = "', num2str(iSet*100 + iSbj, '%05d'), '";\n' ]);
        fprintf(fid, 'var main_seq = [];\n\n');
        %fprintf(fid, 'var main_img_src = "./images/";\n\n');
        
        for iT = 1:numTrial
            
            % curr trial images
            tmpVct = matTrial{iSet}{iSbj}(iT,:);
            
            % does this trial have the attention-check stimulus?
            % NOTE that the stimuli 1031-1040 are the blurry pictures
            attn_check = find(tmpVct > attnChk);
            
            % printf
            fprintf(fid, 'main_seq.push({\n');
            fprintf(fid, '\t"image_array": [\n');
            for ii = 1:3
                if ii < 3
                    fprintf(fid, ['\t\t["', image_names{tmpVct((ii-1)*4+1)}, '", "', image_names{tmpVct((ii-1)*4+2)}, ...
                        '", "', image_names{tmpVct((ii-1)*4+3)}, '", "', image_names{tmpVct((ii-1)*4+4)}, '"], \n',]);
                else
                    fprintf(fid, ['\t\t["', image_names{tmpVct((ii-1)*4+1)}, '", "', image_names{tmpVct((ii-1)*4+2)}, ...
                        '", "', image_names{tmpVct((ii-1)*4+3)}, '", "', image_names{tmpVct((ii-1)*4+4)}, '"] \n',]);
                end
            end
            if ~isempty(attn_check)
                fprintf(fid, '\t],\n');
                fprintf(fid, ['\t"attention_check": "' , image_names{tmpVct(attn_check)}, '"\n']);
            else
                fprintf(fid, '\t]\n');
            end
            fprintf(fid, '});\n\n');
            
        end
        
        fclose(fid);
        
    end
end

