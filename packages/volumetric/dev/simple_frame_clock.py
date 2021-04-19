current_frame = 88

//current keframe raw binary string
print(bin(current_frame))

def safe_list_get (l, idx, default):
  if idx < 0:
    return 0

  try:
    return l[idx]
  except IndexError:
    return default

bin_str_arr = list(bin(current_frame))[2:]
length = len(bin_str_arr)

print('length of binary array or strings')
print(length)

box_0 = int(safe_list_get(bin_str_arr, length - 1, 0))
box_1 = int(safe_list_get(bin_str_arr, length - 2, 0))
box_2 = int(safe_list_get(bin_str_arr, length - 3, 0))
box_3 = int(safe_list_get(bin_str_arr, length - 4, 0))
box_4 = int(safe_list_get(bin_str_arr, length - 5, 0))
box_5 = int(safe_list_get(bin_str_arr, length - 6, 0))
box_6 = int(safe_list_get(bin_str_arr, length - 7, 0))
box_7 = int(safe_list_get(bin_str_arr, length - 8, 0))

print('8 register binary clock box values')
print(box_0)
print(box_1)
print(box_2)
print(box_3)
print(box_4)
print(box_5)
print(box_6)
print(box_7)
