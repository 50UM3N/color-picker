import { useState, useRef, useEffect } from "react";
import { ReactComponent as CopySvg } from "./svg/copy.svg";
import { ReactComponent as EyeDropperSvg } from "./svg/eyeDropper.svg";
import { ReactComponent as TrashSvg } from "./svg/trash.svg";
import { ReactComponent as SettingSvg } from "./svg/settings.svg";
import { ReactComponent as CloseSvg } from "./svg/close.svg";
import {
    hexToRgb,
    hexToHSL,
    hslToHex,
    checkTextColor,
} from "./utils/colorUtil";

function App() {
    const [colorPalette, setColorPalette] = useState([]);
    const [usedColor, setUsedColor] = useState([]);
    const [selectedColor, setSelectedColor] = useState({
        index: 0,
        hex: "",
        rgb: "",
        hsl: "",
    });
    const [contextMenuOpen, setContextMenuOpen] = useState({
        open: false,
        X: 0,
        Y: 0,
    });
    const [copyMessage, setCopyMessage] = useState(false);
    const handleColorPick = () => {
        if (!window.EyeDropper) {
            console.log("Your browser does not support the EyeDropper API");
            return;
        }
        const eyeDropper = new window.EyeDropper();
        eyeDropper
            .open()
            .then((result) => {
                generateColorPalette(result.sRGBHex);
                setSelectedColor({
                    index: 0,
                    hex: result.sRGBHex,
                    rgb: hexToRgb(result.sRGBHex),
                    hsl: hexToHSL(result.sRGBHex),
                });
                setUsedColor((state) => [result.sRGBHex, ...state]);
            })
            .catch((e) => {
                console.log(e);
            });
    };
    const handleColorSelect = (index) => {
        handleContextMenuClose();
        generateColorPalette(usedColor[index]);
        setSelectedColor({
            index,
            hex: usedColor[index],
            rgb: hexToRgb(usedColor[index]),
            hsl: hexToHSL(usedColor[index]),
        });
    };
    const handleContextMenuOpen = (e, index) => {
        e.preventDefault();
        let { pageX, pageY } = e;
        setContextMenuOpen({
            open: !contextMenuOpen.open,
            X: pageX,
            Y: pageY,
            index: index,
        });
    };
    const handleContextMenuClose = () => {
        setContextMenuOpen({ open: false, X: 0, Y: 0 });
    };
    const handleColorDelete = (index) => {
        setSelectedColor({
            index: 0,
            hex: usedColor[index],
            rgb: hexToRgb(usedColor[index]),
            hsl: hexToHSL(usedColor[index]),
        });
        setUsedColor((state) => state.filter((item, i) => i !== index));
    };
    const generateColorPalette = (hex) => {
        let arr = [];
        let [h, s, l] = hexToHSL(hex)[1];
        let counter = 11;
        for (let i = 0; i < 8; i++) {
            arr.push(hslToHex(h, s, counter));
            counter += 11;
        }
        setColorPalette(arr);
    };

    const handleCopyToClipboard = (str) => {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            setCopyMessage(true);
            return navigator.clipboard.writeText(str);
        }
        return Promise.reject("The Clipboard API is not available.");
    };
    useEffect(() => {
        document.onclick = handleContextMenuClose;
    }, []);
    return (
        <>
            {contextMenuOpen.open && (
                <ContextMenu
                    handleDelete={() =>
                        handleColorDelete(contextMenuOpen.index)
                    }
                    style={{
                        top: `${contextMenuOpen.Y}px`,
                        left: `${contextMenuOpen.X}px`,
                    }}
                />
            )}
            {copyMessage && <CopyMessage setCopyMessage={setCopyMessage} />}

            <div className="left-wrapper">
                <div className="eye-dropper-wrapper">
                    <button onClick={handleColorPick}>
                        <EyeDropperSvg />
                    </button>
                </div>
                <div className="color-palette">
                    {usedColor.map((item, index) => (
                        <div
                            className={`color-wrapper ${
                                index === selectedColor.index && "active"
                            }`}
                            key={index}
                            onClick={() => handleColorSelect(index)}
                            onContextMenu={(e) =>
                                handleContextMenuOpen(e, index)
                            }
                        >
                            <div
                                className="color"
                                style={{ backgroundColor: item }}
                            ></div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="right-wrapper">
                <div className="header">
                    <div className="mover">
                        <div></div>
                    </div>
                    <div className="windows-manager-wrapper">
                        <button className="setting-btn">
                            <SettingSvg />
                        </button>
                        <button className="close-btn">
                            <CloseSvg />
                        </button>
                    </div>
                </div>
                <div className="component-outer-wrapper">
                    {usedColor.length == 0 ? (
                        <div className="no-color">
                            <EyeDropperSvg />
                            <p>
                                Press the Color Picker icon to capture a color
                                from your screen.
                            </p>
                        </div>
                    ) : (
                        <>
                            <ColorsPalette colors={colorPalette} />
                            <div className="color-code-wrapper">
                                <ColorCode
                                    type="HEX"
                                    colorCode={selectedColor.hex}
                                    copy={handleCopyToClipboard}
                                />
                                <ColorCode
                                    type="RGB"
                                    colorCode={selectedColor.rgb}
                                    copy={handleCopyToClipboard}
                                />
                                <ColorCode
                                    type="HSL"
                                    colorCode={selectedColor.hsl}
                                    copy={handleCopyToClipboard}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default App;

const CopyMessage = ({ setCopyMessage }) => {
    const ref = useRef(null);
    useEffect(() => {
        const timeout1 = setTimeout(() => {
            ref.current.classList.add("active");
        }, 0);
        const timeout2 = setTimeout(() => {
            ref.current.classList.remove("active");
            setTimeout(() => {
                setCopyMessage(false);
            }, 100);
        }, 2000);

        return () => {
            clearTimeout(timeout1);
            clearTimeout(timeout2);
        };
    }, []);

    return (
        <div className="copy-message" ref={ref}>
            <CopySvg />
            <p>Copied to clipboard</p>
        </div>
    );
};

const ContextMenu = ({ style, handleDelete }) => {
    const ref = useRef(null);
    useEffect(() => {
        setTimeout(() => {
            ref.current.classList.add("active");
        }, 1);
    }, []);

    return (
        <ul ref={ref} className="context-menu" style={style}>
            <li onClick={handleDelete}>
                <TrashSvg />
                <span>Remove</span>
            </li>
        </ul>
    );
};

const ColorCode = ({ type, colorCode, copy }) => {
    return (
        <div className="color-code-palette">
            <p className="color-code-type">{type}</p>
            <p className="color-code">{colorCode}</p>
            <button className="copy-btn" onClick={() => copy(colorCode)}>
                <CopySvg />
            </button>
        </div>
    );
};

const ColorsPalette = ({ colors }) => {
    return (
        <div className="color-palette">
            {colors.map((item) => (
                <div
                    key={Math.random()}
                    className="color"
                    style={{ backgroundColor: item }}
                >
                    <p className={checkTextColor(item) ? "isDark" : "isLite"}>
                        {item.split("#")[1]}
                    </p>
                </div>
            ))}
        </div>
    );
};
