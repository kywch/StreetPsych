
clear;

parpool(3);


%% new sequence generation scheme
%
% Each standard mutli-image rating sessions consists of 60 trials, 
% which can put 708 images and 12 attention checks
%
% This script is to evenly spread all possible image x position pairs 
%
% Currently, we have 1119 images to rate AND 12 positions to spread
% 1119 * 12 / 708 = 18.97 
% So we can almost evenly spread these pairs to 19 sessions/participants
% In this case, this 19 sessions become a set. 

numPos = 12;
numTrial = 59;
numImg = 1119;

numSbjSet = ceil(numImg/numTrial);
numImgTgt = numSbjSet*numTrial;

attnChk = 90000; % image id larger than 90000 are the attention checks


%% the below will evenly spread among numSbjSet (23)
% which will ensure even distribution
% for each session, image id larger than numImg (1119) should be replaced
% with the non-overlapping images
vctImg = (1:numImgTgt)';
seedImgPos = vctImg;
for ii = 2:numPos
    seedImgPos = horzcat(seedImgPos, circshift(vctImg,[numTrial-numTrial*ii, 0]));
end




%% each 19-sbj set will have randperm pos and image
numSet = 150;
% the first set = identity to make sure it works
imgIdx{1} = 1:numImgTgt;
posIdx{1} = 1:numPos;
for iSet = 2:numSet
    imgIdx{iSet} = randperm(numImgTgt);
    posIdx{iSet} = randperm(numPos);
end



%% generating one set (19-sbj) of trial-pos

for iSet = 1:numSet
    for iSbj = 1:numPos
        matTrial{iSet}{iSbj} = zeros(numTrial+1, numPos); % row: trial, col: position
        locAttn{iSet}{iSbj} = -1;
        locAttnPos{iSet}{iSbj} = -1;
    end
end


parfor iSet = 1:numSet
    
    % for each participant, construct trial x pos matrix
    for iSbj = 1:numSbjSet
        
        % 59 trials, excluding the attention checks 
        sbjSeed = seedImgPos( (iSbj-1)*numTrial + (1:numTrial), :);
        sbjSeed2 = [];
        for iPos = 1:numPos
            sbjSeed2 = horzcat(sbjSeed2, imgIdx{iSet}(sbjSeed(:,iPos))');
        end
        % replace the overflow image id with unseen images
        if sum(sbjSeed2(:) > numImg) > 0
            %disp('overflow image found');
            candImg = shuffle(setdiff((1:numImg)', sbjSeed2(:)));
            for ii = 1:(numImgTgt - numImg)
                if sum(ismember(sbjSeed2(:), numImg+ii)) > 0
                    sbjSeed2(sbjSeed2 == (numImg+ii)) = candImg(ii);
                end
            end
        end
        %sbjSeed = vertcat( sbjSeed, 90000 + randperm(12) );
        attnSeed = 90000 + randperm(12);
         
        numTry = 0;
        while 1
            for iPos = 1:numPos
                tmpImg = shuffle(vertcat(sbjSeed2(:, iPos), attnSeed(iPos)));
                % apply shuffled image and position indices
                matTrial{iSet}{iSbj}(:,posIdx{iSet}(iPos)) = tmpImg;
            end
            % the attention check locations should be none-overlapping
            locAttnPos{iSet}{iSbj} = sum(matTrial{iSet}{iSbj} > attnChk, 1);
            if sum(locAttnPos{iSet}{iSbj} > 1)
                continue;
            end
            % the attention checks should be dispersed
            locAttn{iSet}{iSbj} = sum(matTrial{iSet}{iSbj} > attnChk, 2);
            if sum(locAttn{iSet}{iSbj} > 1) == 0
                distAttn = diff(find(locAttn{iSet}{iSbj}));
                if sum(distAttn < 3) == 0
                    break;
                end
            end
            numTry = numTry + 1;
        end
        [iSet iSbj numTry]
    end
end    



% sanity check
for iSet = 1:numSet
    matImgPos2 = nan(numImg, numPos);
    for iImg = 1:numImg
        for iSbj = 1:numSbjSet
            [trialIdx, posIdx] = ind2sub([numTrial+1, numPos], find(matTrial{iSet}{iSbj} == iImg));
            matImgPos2(iImg, posIdx) = iSbj;
            %matImgPos2(iImg, posIdx, 2) = trialIdx;
        end
    end
    sum(isnan(matImgPos2))
    %pause;
end

save('matTrial_1119img_150set.mat', 'matTrial', 'imgIdx', 'posIdx', 'locAttn');


