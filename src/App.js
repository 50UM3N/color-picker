import { useState, useRef, useEffect } from "react";
import { ReactComponent as CopySvg } from "./svg/copy.svg";
import { ReactComponent as EyeDropperSvg } from "./svg/eyeDropper.svg";
import { ReactComponent as TrashSvg } from "./svg/trash.svg";
import { ReactComponent as SettingSvg } from "./svg/settings.svg";
import { ReactComponent as DoneSvg } from "./svg/done.svg";
import { ReactComponent as CloseSvg } from "./svg/close.svg";
import { appWindow } from "@tauri-apps/api/window";
import {
    hexToRgb,
    hexToHSL,
    hslToHex,
    checkTextColor,
} from "./utils/colorUtil";

function App() {
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
            .then(async (result) => {
                setSelectedColor({
                    index: 0,
                    hex: result.sRGBHex,
                    rgb: hexToRgb(result.sRGBHex),
                    hsl: hexToHSL(result.sRGBHex)[0],
                });
                setUsedColor((state) => [result.sRGBHex, ...state]);
                window.localStorage.setItem(
                    "colors", // key
                    JSON.stringify([result.sRGBHex, ...usedColor]) // value
                );
            })
            .catch((e) => {
                console.log(e);
            });
    };
    const handleColorSelect = (index) => {
        handleContextMenuClose();
        setSelectedColor({
            index,
            hex: usedColor[index],
            rgb: hexToRgb(usedColor[index]),
            hsl: hexToHSL(usedColor[index])[0],
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
        setContextMenuOpen({
            open: false,
            X: 0,
            Y: 0,
        });
    };
    const handleColorDelete = (index) => {
        if (index === selectedColor.index)
            setSelectedColor({
                index: 0,
                hex: usedColor[0],
                rgb: hexToRgb(usedColor[0]),
                hsl: hexToHSL(usedColor[0])[0],
            });
        setUsedColor((state) => state.filter((item, i) => i !== index));
    };

    const handleCopyToClipboard = (str) => {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            setCopyMessage(true);
            return navigator.clipboard.writeText(str);
        }
        return Promise.reject("The Clipboard API is not available.");
    };
    const onWindowClose = () => {
        appWindow.close();
    };
    useEffect(() => {
        // disabling the right click only for build not in browser
        // document.addEventListener("contextmenu", (event) =>
        //     event.preventDefault()
        // );
        (async () => {
            // getting the colors from the storage
            // TODO: Implement a store for color
            let colors = await window.localStorage.getItem("colors");
            // check that the colors is not null i.e color is present in the storage or not
            if (colors !== null) {
                colors = JSON.parse(colors);
                // setting the current picked color
                setSelectedColor({
                    index: 0, // current/ top index
                    hex: colors[0], // hex color return from EyeDropper tool
                    rgb: hexToRgb(colors[0]), // converting the color to RGB
                    hsl: hexToHSL(colors[0])[0], // converting the color to HSL
                });
                // setting the new color to the color list
                setUsedColor([...colors]);
            }
        })();
    }, []);

    return (
        <>
            {contextMenuOpen.open && (
                <ContextMenu
                    handleDelete={() =>
                        handleColorDelete(contextMenuOpen.index)
                    }
                    handleContextMenuClose={handleContextMenuClose}
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
                    <div className="mover" data-tauri-drag-region>
                        <div></div>
                    </div>
                    <div className="windows-manager-wrapper">
                        <button
                            className="setting-btn"
                            onClick={handleContextMenuClose}
                        >
                            <SettingSvg />
                        </button>
                        <button className="close-btn" onClick={onWindowClose}>
                            <CloseSvg />
                        </button>
                    </div>
                </div>
                <div className="component-outer-wrapper">
                    {usedColor.length === 0 ? (
                        <div className="no-color">
                            <EyeDropperSvg />
                            <p>
                                Press the Color Picker icon to capture a color
                                from your screen.
                            </p>
                        </div>
                    ) : (
                        <>
                            <ColorsPalette
                                color={selectedColor.hex}
                                setCopyMessage={setCopyMessage}
                            />
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
    }, [setCopyMessage]);

    return (
        <div className="copy-message" ref={ref}>
            <CopySvg />
            <p>Copied to clipboard</p>
        </div>
    );
};

const ContextMenu = ({ style, handleDelete, handleContextMenuClose }) => {
    const ref = useRef(null);
    useEffect(() => {
        document.onclick = handleContextMenuClose;
        ref.current.classList.add("active");
        return () => {
            document.onclick = null;
        };
    }, [handleContextMenuClose]);

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

const ColorsPalette = ({ color, setCopyMessage }) => {
    const [colorPalette, setColorPalette] = useState([]);
    const colorRef = useRef([]);
    const handleColorCopy = (index, str) => {
        colorRef.current[index].classList.add("is-copied");
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            setCopyMessage(true);
            return navigator.clipboard.writeText(str);
        }
        return Promise.reject("The Clipboard API is not available.");
    };
    const mouseHoverOut = (index) => {
        colorRef.current[index].classList.remove("is-copied");
    };
    useEffect(() => {
        let arr = [];
        let [h, s] = hexToHSL(color)[1];
        let counter = 11;
        for (let i = 0; i < 8; i++) {
            arr.push(hslToHex(h, s, counter));
            counter += 11;
        }
        setColorPalette(arr);
    }, [color]);
    return (
        <div className="color-palette">
            {colorPalette.map((item, index) => (
                <div
                    key={index}
                    className={`color ${
                        checkTextColor(item) ? "isDark" : "isLite"
                    }`}
                    style={{ backgroundColor: item }}
                    ref={(el) => (colorRef.current[index] = el)}
                    onClick={() => handleColorCopy(index, item)}
                    onMouseOut={() => mouseHoverOut(index)}
                >
                    <DoneSvg />
                    <p>{item.split("#")[1]}</p>
                </div>
            ))}
        </div>
    );
};
