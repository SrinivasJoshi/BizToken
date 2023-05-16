    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.9;

    import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
    import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
    import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

    contract BizToken is ERC20, ERC20Burnable, AutomationCompatibleInterface {
        uint256 public constant DECIMALS = 18;
        uint256 public immutable MAX_SUPPLY;
        uint256 public immutable MIN_SUPPLY;
        uint256 public mintAmount;
        uint256 public burnAmount;
        uint256 public mintDuration;
        uint256 public burnDuration;
        uint256 public totalBurntAmount;
        uint256 lastBurnTimestamp;
        bool public isPaused;
        address public owner;

        mapping(address => uint256) timestamp;

        event TokensRequested(address receipent,uint256 value);
        event BurntBIZ(uint256 amount,uint256 atTime);
        event Paused();
        event UnPaused();

        modifier onlyOwner{
            require(msg.sender == owner);
            _;
        }

        modifier whenNotPaused{
        require(!isPaused,"Contract currently paused");
        _;
        }

        constructor(
            uint256 _maxSupply,
            uint256 _minSupply,
            uint256 _mintAmount,
            uint256 _burnAmount,
            uint256 _mintDuration,
            uint256 _burnDuration,
            uint256 _mintToOwner
        ) ERC20("BizToken", "BIZ") {
            MAX_SUPPLY = _maxSupply;
            MIN_SUPPLY = _minSupply;
            mintAmount= _mintAmount;
            burnAmount= _burnAmount;
            mintDuration= _mintDuration;
            burnDuration= _burnDuration;
            owner = msg.sender;
            _mint(msg.sender,_mintToOwner);
        }

        function isAllowedToRequest(address user) public view returns(bool answer){
            answer = (timestamp[user] == 0 || (timestamp[user]  < block.timestamp ));
        }
    
        function requestTokens(address _user) external whenNotPaused {
            bool isAllowed = isAllowedToRequest(_user);
            require(isAllowed,"Not sufficient time elapsed since last request");
            require(totalSupply() + mintAmount < MAX_SUPPLY,"Already minted max supply!");
            timestamp[_user] = block.timestamp + mintDuration;
            _mint(_user,mintAmount);

            emit TokensRequested(_user,mintAmount);
        }

        function burn(uint256 /*amount*/)  public pure override {
            revert("burn function is not available");
        }

        function burnFrom(address /*account*/,uint256 /*amount*/) public pure override {
            revert("burnFrom function is not available");
        }

        function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        upkeepNeeded = (block.timestamp > lastBurnTimestamp) && (MIN_SUPPLY >totalBurntAmount + burnAmount);
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        require(block.timestamp > lastBurnTimestamp,"Sufficient time not elapssed");
        require(MIN_SUPPLY >totalBurntAmount + burnAmount,"Sufficient tokens are burnt");

        lastBurnTimestamp = block.timestamp + burnDuration;
        totalBurntAmount+=burnAmount;
        _burn(owner,burnAmount);

        emit BurntBIZ(burnAmount,block.timestamp);
    }

        function setNewMintDuration(uint _newMintTime) external onlyOwner{
            mintDuration = _newMintTime;
        }
        function setNewBurnDuration(uint256 _newBurnDuration) external onlyOwner{
            burnDuration=_newBurnDuration;
        }

        function setNewMintAmount(uint _newMintAmount) external onlyOwner{
            mintAmount = _newMintAmount;
        }

        function setNewBurnAmount(uint256 _newBurnAmount) external onlyOwner{
            burnAmount = _newBurnAmount;
        }

        function pauseContract() external onlyOwner(){
            isPaused=true;
        }

        function unpauseContract() external onlyOwner(){
            isPaused=false;
        }

        receive() external payable{}

        fallback() external payable{}
    }